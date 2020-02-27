function errorHandler (err, req, res, next) {
  console.error('__SERVER ERROR__', err)
  res.status(500).json({ error: err.message })
}

module.exports = errorHandler
