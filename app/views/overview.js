import React from 'react';
import axios from 'axios'
const OverViewPage =(props)=>{
    const handlePress = () => {
        axios.get(`http://localhost:7777/users`).then(data => {
          console.log(data.data);
        });
      };

      const handlePressRestFul = () => {
        axios.get(`http://localhost:7777/test`).then(data => {
          console.log(data.data);
        });
      };
    return (
        <div style={{  display:'flex', flexDirection: 'column', flex: 1}}> 
            <div style={{
                flex: 1,
                flexDirection: 'row',
                height:300,
                display: 'flex'
            }}> 
                <div style={{ flex: 1, backgroundColor:'green', height:300}} onClick={handlePress}>Layer 1</div>
                <div style={{ flex: 2, backgroundColor:'yellow',height:300}} onClick={handlePressRestFul}>Layer 2</div>
                <div style={{ flex: 1, backgroundColor:'green', height:300}}>Layer 3</div>
            </div>
        </div>
    )
}

export default OverViewPage 