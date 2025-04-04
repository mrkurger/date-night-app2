const mongoose = require('mongoose');

module.exports = {
  connect: () => {
    return mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  },
  
  close: () => {
    return mongoose.connection.close();
  }
};
