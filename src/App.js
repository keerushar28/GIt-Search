import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from 'react-query';

// Function to fetch GitHub users based on search query and page number
const fetchGitHubUsers = async (query, page) => {
  const response = await axios.get('https://api.github.com/search/users', {
    params: {
      q: query,
      per_page: 10,
      page: page,
    },
  });
  return response.data;
};

function App() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  
  // React Query to fetch user data
  const { data, isLoading, isError, isFetching, refetch } = useQuery(
    ['users', query, page],
    () => fetchGitHubUsers(query, page),
    {
      enabled: false, // Disable automatic query execution
      onSuccess: (data) => {
        setUsers((prevUsers) => [...prevUsers, ...data.items]);
      },
    }
  );

  // Handle search button click
  const handleSearch = () => {
    setPage(1);
    setUsers([]);
    refetch();
  };

  // Load more users when scrolling to the bottom of the page
  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Infinite scrolling logic
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 1 >=
        document.documentElement.scrollHeight
      ) {
        if (!isFetching) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching]);

  return (
    <div className="App">
      <h1>GitHub User Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for GitHub users..."
      />
      <button onClick={handleSearch} disabled={isFetching || !query}>
        Search
      </button>

      {isLoading && <p>Loading...</p>}
      {isError && <p>Error fetching data. Please try again.</p>}

      <div>
        {users.map((user) => (
          <div key={user.id}>
            <img src={user.avatar_url} alt={user.login} width="50" />
            <a href={user.html_url} target="_blank" rel="noopener noreferrer">
              {user.login}
            </a>
          </div>
        ))}
      </div>

      {isFetching && !isLoading && <p>Fetching more results...</p>}
    </div>
  );
}

export default App;
