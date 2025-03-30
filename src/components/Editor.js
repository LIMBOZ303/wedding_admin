import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../public/styles/Editor.css';

// ✅ Adapter để tải ảnh lên server
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    try {
      const file = await this.loader.file;
      if (!file) throw new Error("Không tìm thấy file");

      // Chuyển đổi file thành base64 vì API của bạn không có endpoint upload riêng
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            default: reader.result
          });
        };
        reader.onerror = error => {
          console.error("FileReader error:", error);
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
function CustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}

// ✅ Component chính
const Editor = ({ value, onChange }) => {
  return (
    <div className="editor-container">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onError={(error, { willEditorRestart }) => {
          // Xử lý lỗi khởi tạo editor
          console.error('CKEditor error:', error);
          if (willEditorRestart) {
            console.log('Editor sẽ khởi động lại sau lỗi.');
          }
        }}
        onChange={(event, editor) => {
          try {
            const data = editor.getData();
            onChange(data);
          } catch (error) {
            console.error("Error in CKEditor onChange:", error);
          }
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
          // Giảm kích thước, chất lượng ảnh để giảm lỗi do dữ liệu quá lớn
          image: {
            resizeUnit: "%",
            resizeOptions: [
              {
                name: 'resizeImage:original',
                value: null,
                label: 'Original'
              },
              {
                name: 'resizeImage:50',
                value: '50',
                label: '50%'
              },
              {
                name: 'resizeImage:75',
                value: '75',
                label: '75%'
              }
            ],
            toolbar: [
              'resizeImage',
              'imageTextAlternative'
            ]
          },
          licenseKey: "eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NDQzMjk1OTksImp0aSI6IjM0ODVjYTZkLTZlZDktNGI1NC04ODY4LTY4YzkwMTc4YzVmMyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6IjdmZjJmZDA5In0.NvshURZVqqJo9bb2Tr38vv0az7iqdg5hmqWwKNJuZ57yhp9sVK5IgTqr9x_BtSCTtL6eiKSnW_WXRyVHTkU5hg" // License key
        }}
      />
    </div>
  );
};

export default Editor; 