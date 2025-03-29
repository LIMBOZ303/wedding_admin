import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FileLoader } from '@ckeditor/ckeditor5-upload';
import { Editor } from '@ckeditor/ckeditor5-core';
import '../public/styles/Editor.css';

// ✅ Adapter để tải ảnh lên server
class MyUploadAdapter {
  private loader: FileLoader;

  constructor(loader: FileLoader) {
    this.loader = loader;
  }

  async upload() {
    try {
      const file = await this.loader.file;
      if (!file) throw new Error("Không tìm thấy file");

      // Chuyển đổi file thành base64 vì API của bạn không có endpoint upload riêng
      return new Promise<{ default: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            default: reader.result as string
          });
        };
        reader.onerror = error => {
          reject(error);
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  abort() {
    console.log("Upload aborted");
  }
}

// ✅ Plugin tùy chỉnh cho CKEditor
function CustomUploadAdapterPlugin(editor: Editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader: FileLoader) => {
    return new MyUploadAdapter(loader);
  };
}

// ✅ Interface props cho Editor
interface EditorProps {
  value: string;
  onChange: (data: string) => void;
}

// ✅ Component chính
const EditorComponent: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="editor-container">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{
          extraPlugins: [CustomUploadAdapterPlugin], // Thêm plugin upload ảnh
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            'bulletedList',
            'numberedList',
            '|',
            'indent',
            'outdent',
            '|',
            'imageUpload',
            'blockQuote',
            'insertTable',
            'mediaEmbed',
            'undo',
            'redo',
          ],
          language: 'vi',
          licenseKey: "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDQzMjk1OTksImp0aSI6IjM0ODVjYTZkLTZlZDktNGI1NC04ODY4LTY4YzkwMTc4YzVmMyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjdmZjJmZDA5In0.NvshURZVqqJo9bb2Tr38vv0az7iqdg5hmqWwKNJuZ57yhp9sVK5IgTqr9x_BtSCTtL6eiKSnW_WXRyVHTkU5hg" // License key
        }}
      />
    </div>
  );
};

export default EditorComponent; 