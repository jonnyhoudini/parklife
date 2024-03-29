require('dotenv').config();
const app = require('./app'); // Adjust the path if your app.js is in a different folder
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});