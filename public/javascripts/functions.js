Array.prototype.removeItem = function(str) {
   for( i = 0; i < this.length ; i++)
   {
     if(escape(this[i]).match(escape(str.trim()))){
       this.splice(i, 1);  break;
     }
   }
  return this;
}

Array.prototype.findItem = function(value){
  var ctr = "";
  for (var i = 0; i < this.length; i++) {

    if (this[i] == value) {
      return true;
    }
  }
  return false;
};