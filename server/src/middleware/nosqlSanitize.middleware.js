const sanitize = (obj) => {
  if (obj instanceof Object) {
    for (const key in obj) {
      if (key.startsWith("$")) {
        delete obj[key];
      } else {
        sanitize(obj[key]);
      }
    }
  }
};

export const nosqlSanitizer = (req, res, next) => {
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};
