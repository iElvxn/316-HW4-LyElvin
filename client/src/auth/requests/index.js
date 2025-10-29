/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/

const BASE_URL = 'http://localhost:4000/auth'

const fetchRequest = async (endpoint, options = {}) => {
    const config = {
        credentials: 'include', // same as axios.defaults.withCredentials = true
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `HTTP error status: ${response.status}`);
    }

    return { data, status: response.status };
};

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

export const getLoggedIn = () => fetchRequest(`/loggedIn/`, {method: "GET"});
export const loginUser = (email, password) => {
    return fetchRequest(`/login/`, {
        method: "POST",
        body: JSON.stringify({ email, password })
    })
}
export const logoutUser = () => fetchRequest(`/logout/`, {method: "GET"})
export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
    return fetchRequest('/register/', {
        method: "POST",
        body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            passwordVerify
        })
    })
}
const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis
