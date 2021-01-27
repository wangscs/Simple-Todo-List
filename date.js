
// Returns todays date in the format
// Weekday, Month 23
exports.getDate = function (){
  
  const today = new Date();
      
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };

  return today.toLocaleDateString("en-US", options);
}


// Only returns the weekday
exports.getDay = function (){
  
  const today = new Date();
      
  const options = {
    weekday: "long",
  };

  return today.toLocaleDateString("en-US", options);
}