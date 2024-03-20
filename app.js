require('dotenv').config();
require('express-async-errors');
// extra security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')
const express = require('express');
const app = express();

const authRouter = require('./routes/auth')
const jobsRouter = require('./routes/jobs')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
//connect DB
const connectDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')

app.use(express.json());
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

app.set('trust proxy', 1)
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, //15minutes
  max: 100, //limit each ip to 100 requests per windowMs
}))

app.use(helmet())
app.use(cors())
app.use(xss())

// routes
app.get('/',(req, res)=>{
  res.send('jobs api')
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/jobs', authenticateUser, jobsRouter)


const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();