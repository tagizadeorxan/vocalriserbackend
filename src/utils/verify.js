const confirmEmail = (hash) => {

    const timeElapsed = Date.now();
    const today = new Date(timeElapsed);

    console.log(hash)
    const url = `http://localhost:3000/api/v1/users/confirmation/${hash}`
    let html = `<div style="  text-align: center;">
    <h1>Vocalriser</h1>
      <div>
            <p style="width:800px;margin-left:auto;margin-right: auto">We need a little more information to complete your registration, including a confirmation of your email address. 
    
                   Click below to confirm your email address: </p>

               <a href="${url}"><button style="  background-color: #4CAF50; /* Green */
							border: none;
							color: white;
							padding: 15px 32px;
							text-align: center;
							text-decoration: none;
							display: inline-block;
							font-size: 16px;
							margin: 4px 2px;
							cursor: pointer;">Confirm</button></a>
                   
       <p>${today.toUTCString()}</p>
        </div>`
        return html;
}


module.exports = {
    confirmEmail
}