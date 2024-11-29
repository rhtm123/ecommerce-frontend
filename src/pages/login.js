import React, { useState } from 'react';

import { useRouter } from "next/router";
import { myFetch } from '@/utils/myFetch';

export default function Login() {
  const { token, login, authUser } = useAuth();
  const router = useRouter();

  const {next} = router.query;
  // console.log(next);

  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState(null); // New state for error message
  const [loading, setLoading] = useState(false); // New state for loading


// Handle changes in input fields

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  React.useEffect(() => {
    if (authUser) {


      if (next){
        router.push(next);
      } else {
      
      if (authUser?.role === "farmer") {
        router.push('/farmer-dashboard');
      } else {
        router.push('/center-dashboard');
      }
    }
  }
  }, [authUser]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // let url = "https://flatfolio.onrender.com/api/members/login";
    let url = `/api/users?type=login`;
  
    try {

      setLoading(true); // Start loading
      console.log(formData);

      let data = await myFetch(url, 'POST', formData);

    //   const response = await fetch(url, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData),
    //   });

    //   console.log(response);
  
      // if (!response.ok) {
      //   throw new Error(`Login failed. Status: ${response.status}`);
      // }
  
      // Handle the response, e.g., update state or redirect to another page
      // const data = await response.json();
      console.log('Login successful:', data);
      login(data);
      // setErrorMessage(null); // Reset error message on successful login
    } catch (error) {
      console.error('Login error:', error.message);
      setErrorMessage('Wrong mobile or password'); // Set error message for wrong login details
    } finally {
      setLoading(false); // Stop loading, regardless of success or failure
    }
  };
  

// You can perform further actions like making an API request here
  return (
    <div className="hero min-h-screen bg-base-100 flex items-center justify-center">
      <div className="card w-full max-w-sm shadow-2xl bg-base-100">
        {!token &&
          <form className="card-body text-center" onSubmit={handleSubmit}>
            <h1 className="text-5xl font-bold mb-6">Login</h1>
            {errorMessage && (
              <div className="text-red-500 mb-4">
                {errorMessage}
              </div>
            )}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mobile</span>
              </label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="mobile"
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="input input-bordered"
                required
              />
            </div>
            <div className="form-control mt-6">
            <button type="submit" className="btn btn-primary">
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>
        }

        {token && <div>
          <h1>You are already logged in</h1>
        </div>}
      </div>
    </div>
  );
}