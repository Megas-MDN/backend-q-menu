module.exports = (req, res, _next) => {
  return res.status(501).json({
    message: 'Rota não implementada',
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.boy,
  });
};
