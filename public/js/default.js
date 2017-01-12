// Add an #id property to getData to identify the user eventually
function search() {
  const url = 'http://localhost:6969/coords'
  return fetch(url).then((response) => {
    return response.json()
  }).catch(function(error) {
    alert(`There was an error with your request: ${error}`)
  })
}

document.getElementById("get-position").addEventListener("click", () => {
  const thenable = search()
  thenable.then((response) => {
    console.log(response)
  })
}, false);
