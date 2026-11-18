module.exports = (err, req, res, next) => {
  if (err.name === 'MulterError') {
    err.status = 400;
    if (err.code === 'LIMIT_FILE_SIZE') err.message = 'File is too large (max 5 MB)';
  }
  if (err.code === 'ER_DUP_ENTRY') { err.status = 409; err.message = 'That value already exists'; }
  if (!err.status) console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong on the server' });
};
