import React, { FunctionComponent, ReactElement } from 'react';

import { useDropzone } from 'react-dropzone';

import { ReactComponent as UploadIcon } from '../assets/icons/upload.svg';
import './FileUpload.styles.css';

/**
 * File upload
 */
const FileUpload: FunctionComponent<{ onFile?: (file: File) => unknown }> = ({ onFile }): ReactElement => {
  // Prepare and configure dropzone
  const { getRootProps, getInputProps, open } = useDropzone({
    accept: 'application/json',
    noClick: true,
    noKeyboard: true,
    onDropAccepted: (files: Array<File>): void => {
      if (onFile) {
        onFile(files[0]);
      }
    },
  });

  // Render
  return (
    <div {...getRootProps({ className: 'file-upload' })}>
      <input {...getInputProps()} />
      <UploadIcon className="file-upload__icon" />
      <p className="file-upload__label">
        <span>Drag and drop file here or&nbsp;</span>
        <button className="file-upload__button" type="button" onClick={open}>
          browse
        </button>
      </p>
    </div>
  );
};

export default FileUpload;
