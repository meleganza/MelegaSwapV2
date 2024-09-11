import React from 'react';
import UploadIcon from '../icons/upload.svg';
import PropTypes from 'prop-types';

const UploadBox = ({ imageUrl, handleClick, className, style }) => {
  return (
  <div className={`upload-box ${className || ''}`} style={style} onClick={handleClick}>
  {imageUrl ? (
    <img src={imageUrl} alt="Preview" className="preview-image" />
  ) : (
    <>
      <img src={UploadIcon} alt="Upload Icon" className="upload-icon" />
      <div className="upload-text">Upload</div>
    </>
  )}
  </div>
  );
};

UploadBox.propTypes = {
  imageUrl: PropTypes.string,
  handleClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

UploadBox.defaultProps = {
  imageUrl: undefined,
  className: '',
  style: {},
};

export default UploadBox;