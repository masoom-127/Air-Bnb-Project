module.exports = function(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);  // Pass the error to the next middleware
  };
}; 