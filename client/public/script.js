let form = document.querySelector('form')
let candidate = document.querySelector('#candidate_id')
let vote_result = document.querySelector('.vote_result');

const {username, room} = Qs.parse(location.search, {
  ignoreQueryPrefix:true
})

const socket = io('http://localhost:1337')

socket.on('totalVote', (vote)=> {
  vote_result.innerHTML = vote
})

// Message from server 
socket.on('message', message => {
  outputMessage(message)
  console.log('log client message (e)', message)
  // Scroll down 
  chatMsg.scrollTop = chatMsg.scrollHeight
})

socket.on('connect',(socket)=> {
  console.log('connection successfully')
})

// Event lisnning 
form.addEventListener('submit', (e)=> {
e.preventDefault();

candidate.

// Emit vote to server 
socket.emit('createVote', ())

// // Emit message to server
// socket.emit('chatMessage', msg)

//   console.log('log client msg from chatMessage (e)', msg)
//   // clear input 
//   e.target.msg.value= ''
//   e.target.msg.focus();
})

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `          <p class="meta">${message.username}<span>${message.time}</span></p>
          <p class="text">
            ${message.text}
          </p>`;
  document.querySelector('.chat-messages')?.appendChild(div)
  
}