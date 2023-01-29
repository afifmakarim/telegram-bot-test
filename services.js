const axios = require("axios");

async function getUserPosts(username) {
  const options = {
    method: "GET",
    url: "https://instagram191.p.rapidapi.com/user/posts/",
    params: { user_id: username, count: "10" },
    headers: {
      "X-RapidAPI-Key": "5YWxfJ1ATemsh5zGsL4MY1oMQUP9p1eTN7sjsnoP0UVs6F1A7i",
      "X-RapidAPI-Host": "instagram191.p.rapidapi.com",
    },
  };
  const response = await axios.request(options);
  return response;
}

// (async () => {
//   const data = await getUserPosts("5550013354");
//   console.log(data);
// })();

module.exports = getUserPosts;
