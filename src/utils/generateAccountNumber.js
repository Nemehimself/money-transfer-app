function generateAccountNumber() {
    // Generate a random 10-digit number
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }
  
  export default generateAccountNumber;
  