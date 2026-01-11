import express, { type Request, type Response } from 'express';

const app = express();
const port = 3000;

app.get('/', (_: Request, res: Response) => {
  res.status(200).json({ message: 'Hello, World!' });
});
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
