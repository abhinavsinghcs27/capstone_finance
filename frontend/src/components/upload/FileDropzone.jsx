import { useRef, useState } from "react";
import {
  UploadCloud,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".csv", ".xlsx"];

const FileDropzone = ({ onFileSelect }) => {
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat(
      (bytes / Math.pow(1024, index)).toFixed(2)
    )} ${sizes[index]}`;
  };

  const validateFile = (file) => {
    const fileName = file.name.toLowerCase();

    const hasValidExtension = ACCEPTED_EXTENSIONS.some((extension) =>
      fileName.endsWith(extension)
    );

    const hasValidType =
      ACCEPTED_TYPES.includes(file.type) || hasValidExtension;

    if (!hasValidType) {
      return "Please upload a PDF, CSV, or XLSX file.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 15 MB.";
    }

    return null;
  };

  const handleFile = (file) => {
    if (!file) return;

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);

      if (onFileSelect) {
        onFileSelect(null);
      }

      return;
    }

    setError("");
    setSelectedFile(file);

    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    handleFile(file);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="file-dropzone-wrapper">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.csv,.xlsx"
        onChange={handleInputChange}
        className="file-dropzone-input"
      />

      {!selectedFile ? (
        <div
          className={`file-dropzone ${
            isDragging ? "file-dropzone--active" : ""
          } ${error ? "file-dropzone--error" : ""}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              handleBrowseClick();
            }
          }}
        >
          <div className="file-dropzone__icon">
            <UploadCloud size={34} strokeWidth={1.8} />
          </div>

          <h3>Upload your financial statement</h3>

          <p>
            Drag and drop your file here, or{" "}
            <span>browse from your device</span>
          </p>

          <div className="file-dropzone__formats">
            <span>PDF</span>
            <span>CSV</span>
            <span>XLSX</span>
          </div>

          <small>Maximum file size: 15 MB</small>
        </div>
      ) : (
        <div className="selected-file">
          <div className="selected-file__icon">
            <FileText size={28} />
          </div>

          <div className="selected-file__details">
            <div className="selected-file__name">
              <CheckCircle2 size={18} />
              <span>{selectedFile.name}</span>
            </div>

            <p>{formatFileSize(selectedFile.size)}</p>
          </div>

          <button
            type="button"
            className="selected-file__remove"
            onClick={handleRemoveFile}
            aria-label="Remove selected file"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {error && (
        <div className="file-dropzone-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;