import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  // State to hold the fetched data from the backend
  const [data, setData] = useState(null);

  // useEffect hook to fetch data
  useEffect(() => {
    // Make a GET request to the backend API
    axios.get('/api/data')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching data!", error);
      });
  }, []);

  return (
    <div className="App">
      <h1>Zenith Bank</h1>
      {data ? (
        <div>
          <h2>Data from Flask:</h2>
          {/* Display the fetched data as a formatted JSON string */}
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        // Show a loading message while data is being fetched
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default App;