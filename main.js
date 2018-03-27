window.onload = function(){

  let vm = new Vue({
    el: '#vue-calculator',
    data: {
      title: 'Vue Calculator',
      output: '',
      tempanswer: '',
      calculationsArray: [],
      displayTemp: false,
      backspaceActive: true,
      calculateActive: true,
      squareActive: true,
      historyActive: true,
      historyDisplay: true,
      historyDisplayOnce: false,
      historyArray: [],
      resetCalc: false
    },
    methods: {
      addToArray: function(event, type){
        if(this.resetCalc){
          this.output = '';
          this.resetCalc = false;
        }
        this.backspaceActive = false;
        if(type){

          if(type == '√'){
            this.output = '√' + this.output;
          } else {
            this.output += type;
          }

          this.calculationsArray.push(type);
        } else {
          let value = event.target.innerText;
          if(value == '0' && this.output == '0'){
            console.log('Not adding another 0');
          } else {
            this.output += value;
            this.calculationsArray.push(value);
          }
        }

        /* If it's the square root, we display it instantly */
        if(type == '√' || type == 'x²'){
          this.calculate(event, 'realOutput');
        } else {
          this.calculate(event, 'temp');
        }

      },
      clearOutput: function(event){
        /* Clear output, tempanswer and the calculationsArray */
        this.output = '';
        this.tempanswer = '';
        this.calculationsArray = [];
        this.backspaceActive = true;
        this.calculateActive = true;
      },
      calculate: function(event, outputArea){
        /* Calculate everything */
        let total = 0;
        let prevArray = [];
        let numbersArray = [];
        let prev;

        /* Create the numbers and add them to the numbersArray */
        for(let val of this.calculationsArray){

          /* Räkna ut och dela upp arrayen. Lägg sedan korrekt värden i en ny array */
          if(isNaN(val)){
            if(val == ','){
              prevArray.push('.');
            } else {
              prev = prevArray.join('');
            }

          } else {
            /* This is a number, push it into prev */
            prevArray.push(val);
          }
          /* After we've checked the value of the current position, if we added a number. push it into the numbersArray */
          if(prev){
            numbersArray.push(prev);
            numbersArray.push(val);
            prev = '';
            prevArray = [];
          }
        }

        /* After the loop is done put the rest of the values into the numbersArray */
        numbersArray.push(prevArray.join(''));
        console.log('numbersArray', numbersArray);


        /* Now we have the correct numbersArray. Lets calculate everything */
        let prevSeparator;
        let beforecalc;

        /* Start by calculating Multiplication and division */
        numbersArray = calcMD(numbersArray);
        /* Calculations */
        for(let i = 0 ; i <= numbersArray.length-1; i++){

          /* Set the value here */
          let value = numbersArray[i];

          /* If value is a separator, set it in prevSeparator */
          if(isNaN(value)){
            this.displayTemp = true;
            this.calculateActive = false;
            prevSeparator = value;
            continue;
          }

          /* Check if the total isn't defined. If not set it to the current value */
          if(!total){
            console.log('Setting total to: ' + value);
            total += value-0;
            continue;
          }

          /* If the prevSeparator is defined, calculate this value based on it*/
          if(prevSeparator){
            beforecalc = total;
            if(prevSeparator == '+'){
              total += value-0;
            } else if(prevSeparator == '-'){
              total -= value;
            } else if(prevSeparator == '*'){
              total *= value;
            } else if(prevSeparator == '/'){
              total /= value;
            } else if(prevSeparator == '%'){
              total /= 100;
            } else if(prevSeparator == '√'){
              total = Math.sqrt(total);
            } else if(prevSeparator == 'x²'){
              total *= total;
            }
            prevSeparator = '';
          }
        }

        /* Set prevValue after calculations */
        console.log('Total is: ', total);

        /* If the total is positive activate square root */
        if(total > 0){
          this.squareActive = false;
        }

        /* Set the correct value in our data object */
        if(outputArea == 'temp'){
          if(this.displayTemp){
            if(total == Infinity){
              this.tempanswer = beforecalc;
            } else if (total == 0){
                if(this.calculationsArray[this.calculationsArray.length-1] == '*'){
                  this.tempanswer = beforecalc;
                } else {
                  this.tempanswer = total;
                }
            } else {
              this.tempanswer = total;
            }

          }
        } else {

          /* Put the output to history */
          this.historyArray.push([this.output, total]);
          console.log(this.historyArray);
          /* Set the output answer */
          this.output = total;

          /* Reset the calc */
          this.resetCalc = true;

          /* Hide tempanswer */
          this.displayTemp = false;
          this.tempanswer = '';

          /* Toggle history */
          this.historyActive = false;
          if(!this.historyDisplayOnce){
            this.historyDisplay = false;
            this.historyDisplayOnce = true;
          }


          /* Disabled backspace and calculate */
          this.backspaceActive = true;
          this.calculateActive = true;
          this.squareActive = true;


          /* Empty calculationsArray and add this value instead */
          this.calculationsArray.length = 0;
          //this.calculationsArray.push(total);

          /* Empty numbersArray and add this value instead */
          numbersArray.length = 0;
          //numbersArray.push(total);
        }
      },
      backspace: function(event){

        /* BackSpaceActive */
        if(!this.backspaceActive){
          this.output = this.output.toString().substring(0, this.output.length-1);
          this.calculationsArray.pop();
          this.displayTemp = false;
          this.calculateActive = true;
          /* If there isn't a separator in the calculation, don't display tempanswer */
          for(let val of this.calculationsArray){
              if(isNaN(val)){
                this.displayTemp = true;
                this.calculateActive = false;
              }
          }
          /* If the calculationsArray length is 0, disable the tempanswer & backspaceActive */
          if(this.calculationsArray.length == 0){
            this.backspaceActive = true;
            this.squareActive = true;
          } else {
            this.calculate(event, 'temp');
          }
        }
      }, removeHistory: function(event){
        this.historyArray.length = 0;
        this.historyActive = true;
        this.historyDisplay = true;
        this.historyDisplayOnce = false;
      }, relocate: function(url){
        window.location.assign(url);
      }
    }
  })


  /* End of onload */
}

var multiplication = function(a, b){
    return a * b;
}
var division = function(a, b){
    return a / b;
}

function calcMD(numbersArray){

  let prevSeparator;
  let prevValue;
  let calculatedArray = [];
  for(let i = 0; i <= numbersArray.length - 1; i++){
    let value = numbersArray[i];
    calculatedArray.push(value);

    if(isNaN(value)){
      if(value == '*'){
        prevSeparator = multiplication;
      } else if(value == '/'){
        prevSeparator = division;
      }
      continue;
    }

    /* If previous separator exists */
    if(prevSeparator && value && prevValue){
        console.log('previous value is: ' + prevValue);
        console.log('separator is: ' + prevSeparator);
        console.log('Value is: ' + value);
        calculatedArray.splice(i-2,2);
        calculatedArray[i-2] = 0;
        calculatedArray[i-1] = '+';
        calculatedArray[i] = prevSeparator(prevValue, value);
        //numbersArray.push(prevSeparator(prevValue, value));
        console.log('We are at index: '+ i);
        console.log('Answer is: ',prevSeparator(prevValue, value));
        console.log('numbersArray is: ', numbersArray);
        console.log('calculatedArray is:', calculatedArray);
        prevValue = prevSeparator(prevValue, value);
        prevSeparator = '';
    } else {
      prevValue = value;
    }

  }
  return calculatedArray;
}
