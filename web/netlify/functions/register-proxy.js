// netlify/functions/register-proxy.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // POST 요청인지 확인
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" })
    };
  }

  try {
    // 요청 데이터 파싱
    const data = JSON.parse(event.body);
    
    // name을 username으로 변환
    const transformedData = {
      ...data,
      username: data.name || 'user_' + Math.random().toString(36).substring(2, 10),
    };
    
    console.log('Sending request to backend:', JSON.stringify(transformedData));
    
    // 백엔드 API로 요청 전달
    const response = await fetch("https://beekeper-d0e3.onrender.com/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(transformedData)
    });
    
    // 응답 받기
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }
    
    // 응답 반환
    return {
      statusCode: response.status,
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error('Error in register-proxy:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "서버 오류", error: error.message })
    };
  }
};
