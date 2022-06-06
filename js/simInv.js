'use strict'

/** 
 * Inventory Simulation excercise
 * Simulation starts on day: 0, user starts working on day #1
 * Versions
 ** 0.1 - 31 march 2021 Create logic for placing orders and initial conditions
 ** 0.2 - 02 april 2021 Change logic to days instead of weeks for easier understanding of 
 ** orders within time period + Initial html setup with button for placing orders
 ** 0.3 - 11 april 2021 Modify behaviour to allow only a valid number to be entered
 ** 0.4 TBD Implement hide/show data table (https://twitter.com/Te_Challa/status/1526743428876275713?t=tbVC-_dxIx60P3E__afloA&s=03)
 */

// Define conditions
let day = 0; // Starting period of simulation

// Define initial parameters of simulation 
const numDays = 31; // Number of days to simulate (t = 1, 2, 3, ... numDays
const inventory0 = 26; // Initial inventory (t = 0)
const backorder0 = 0; // Initial backorder (t = 0)
const demand0 = 0; // Initial demand (t = 0)
const order0 = 0; // Initial order (t = 0)
const arrival0 = {  dayOfOrderQ: 0,
                    orderQ:0, 
                    arrivalSpan:0, 
                    dayOfArrival: 0 }; // Initial arrival (t = 0)
const arrival0val = 0
let msj = "";
let msj2 = "";
let hCostPerUnitDay = 10;
let hCost = 0;
let bCostPerUnitDay = 20;
let bCost = 0;
let orderingCostPerOrder = 250;
let orderingCost = 0;
let tCost = 0;

// Create the demands for clients on current session 
function generateDemands(numDays, demand0){
    let dailyDemand = []; // Array of random demands
    for(let i = 1; i <= numDays; i++){
        // test random generator from 10 to 15
        let demandForDay = Math.floor(Math.random() * (1 - 10 + 15)) + 10 
        // Add logic to increase demands on weekends
        // PENDING
        dailyDemand.push(demandForDay);
            // add normal random distribution to certain ranges in array
            // reproducible example
        };
    // dailyDemand = [13,10,12,12,15];  
    dailyDemand.unshift(demand0)
    console.log("Demand generated!")
    return dailyDemand
};
    
// Generate array inventories
let onHandInventory = [inventory0]

// Generate array for backorders
let backordersArr = [backorder0]

// Generate arrays of demands
let demandsArr = generateDemands(numDays,demand0)
let demandsArrGr = [null]

// Generate array of orders
let ordersArr = [order0]

// Generate array of arrival objects
let arrivalsObjArr = [arrival0]

// Generate array of arrivals
let arrivalsArr = new Array(numDays+3).fill(0)
arrivalsArr[0] = arrival0val

// Generate days array
let daysArray = [day] 

// Create JSON for importing to grid.js
let jsonAllData = []


// Place order and update arrays
// let order = 9; // Ordered quantity for day
// let arrivalSpan = 2; // Time it takes for the order (Q) to arrive
function placeOrder(order,arrivalSpan){
    // Evalúa si el dato es válido para continuar con el ejercicio
    if (day === numDays){
        console.log("End of simulation")
        updateDomElements(msj="&#x1F60E You have reached the end of the simulation! <hr>",msj2="");
    } else if (isNaN(order) || order < 0 || order > 99) {
        console.log("Input is not valid")
        updateDomElements(msj=" &#x26D4 Please enter a valid number of boats to order (0-99) <hr>",msj2="");
    } else {
        day += 1;

        // Update orders
        let msj2A = `${order} boats ordered in day: ${day}.`
        console.log(msj2A)
        ordersArr.push(order);

        // Update arrivals arrivalsObjArr, arrivalsArr y orderingCost
        let msj2B = ""
        if(order>0){
            msj2B = `Your order will arrive in ${arrivalSpan} day(s) <br> (Available to use in day ${day+arrivalSpan})`
            orderingCost += orderingCostPerOrder
        } 
        
        console.log(msj2B)
        arrivalsArr[day+arrivalSpan]+=order
        let arrivalObj = { dayOfOrderQ: day,
            orderQ: order, 
            arrivalSpan: arrivalSpan, 
            dayOfArrival: day+arrivalSpan };
        arrivalsObjArr.push(arrivalObj);

        msj2 = msj2A + "<br>" + msj2B + "<hr>"

        // update days and demands for graph
        daysArray.push(day)
        demandsArrGr.push(demandsArr[day]);
        document.getElementById("myChart").remove(); //canvas
        let div = document.querySelector("#chartReport"); //canvas parent element
        div.insertAdjacentHTML("afterbegin", "<canvas id='myChart'></canvas>"); //adding the canvas again
        updateDemGraph();

        // Verify if there is enough inventory
        let availableInvForDay = onHandInventory[day-1] + arrivalsArr[day]
        let requiredDemandForDay = demandsArr[day] + backordersArr[day-1]
        if(availableInvForDay < requiredDemandForDay){
            msj = "&#x1f615 Bad news <br> Not enough inventory for day: " + day + " <hr>"
            console.log(msj);
            // Update inventories
            onHandInventory.push(0);
            // Update backorders
            let backorderDay = requiredDemandForDay-availableInvForDay;
            backordersArr.push(backorderDay);
            bCost += backorderDay * bCostPerUnitDay

        } else if (availableInvForDay >= requiredDemandForDay){
            msj = "&#x1F609 Good job! <br> Enough inventory for day " + day + "<hr>"
            console.log(msj);
            // Update inventories and cost
            let inventoryDay = availableInvForDay-requiredDemandForDay;
            onHandInventory.push(inventoryDay);
            hCost += inventoryDay * hCostPerUnitDay
            // Update backorders
            backordersArr.push(0);  

        } else {
            msj = "&#x1F630 Ups, something went wrong with your order"
            console.log(msj);
        };
        
        // Create table for displaying results
        jsonAllData.push({
            day: day,
            demand: demandsArr[day],
            inventory: onHandInventory[day],
            backorders: backordersArr[day],
            arrivals: arrivalsArr[day]        
        })
        updateDataTable();
        displayResults();
        updateDomElements(msj,msj2);
    }
    return false;
};


// Update elements in document
function updateDomElements(msj,msj2){
    // DayBox update
    let dayBox = document.getElementById("dayBox");
    dayBox.innerHTML = `<h5> ${day+1} out of ${numDays}</h5>`

    // Inventory Update
    let currentInv = onHandInventory[onHandInventory.length-1];
    let currentBackorder = backordersArr[backordersArr.length-1];
    let infoInventoryBox = null;
    if(currentInv > 0){
        infoInventoryBox = `You have <strong>${currentInv}</strong> boats available` 
    } else if (currentBackorder > 0){
        infoInventoryBox = `You have <strong> ${currentBackorder} </strong> boats pending`
    } else {
        infoInventoryBox = `Ups! you don't have any boats available!`
    }
    let inventoryBox = document.getElementById("inventoryBox");
    inventoryBox.innerHTML = `${infoInventoryBox}`
    
    // Assistant message
    let assistantBox = document.getElementById("assistantBox");
    assistantBox.innerHTML = `${msj}`

    // Demand message
    let demandBox = document.getElementById("demandBox")
    demandBox.innerHTML = `Yesterday's demand was: <strong>${demandsArr[day]}</strong> boats`
   
    // Arrivals message
    let arrivalsBox = document.getElementById("arrivalsBox")
    arrivalsBox.innerHTML = `${msj2}`

    // Costs mesaje
    // Holding
    let holdingCostBox = document.getElementById("holdingCostBox")
    holdingCostBox.innerHTML = `$ ${hCost}`
    // Backorder
    let backorderCostBox = document.getElementById("backorderCostBox")
    backorderCostBox.innerHTML = `$ ${bCost}`
    // Ordering
    let orderingCostBox = document.getElementById("orderingCostBox")
    orderingCostBox.innerHTML = `$ ${orderingCost}`
    // Total
    let totalCostBox = document.getElementById("totalCostBox")
    tCost = hCost + bCost + orderingCost
    totalCostBox.innerHTML = `$ ${tCost}` 
}
updateDomElements(msj="&#x1F446 Please order something to start <hr>",msj2="");

// Testing
function displayResults(){
    console.log("--- --- ---");
    console.log("Current day: ", day+1);
    console.log("On hand inventory: "+onHandInventory);
    console.log("Backorders: " + backordersArr);
    console.log("Demands: "+ demandsArr);
    console.log("Demands (graph): "+ demandsArrGr);
    console.log("Orders (Q): " + ordersArr);
    console.log("Arrivals: "+arrivalsArr);
    console.log("Arrivals OBJ:...");
    console.log( arrivalsObjArr);
    console.log("Current Holding Cost: $",hCost);
    console.log("Current Backorder Cost: $",bCost);
    console.log("Current Ordering Cost: $",orderingCost);
}
displayResults();

// React to user actions
function placeOrderDOM(){
    let orderInput = parseInt(document.getElementById("orderInput").value,10);
    let orderTimeSpan = Math.floor(Math.random() * (1 - 1 + 3)) + 1

    placeOrder(orderInput,orderTimeSpan)
    // Update button status
    let placeOrderButton = document.getElementById("placeOrder")
    placeOrderButton.blur()
}
document.getElementById("placeOrder").addEventListener("click",placeOrderDOM)

// Draw inventory
function updateDemGraph(){
    var ctx = document.getElementById('myChart').getContext('2d');
    let labels = daysArray;
    let data = {
    labels: labels,
    datasets: [
        {label: 'Daily demand',
        data: demandsArrGr,
        fill: false,
        borderColor: 'rgba(33, 37, 41,0.5)',
        tension: 0.3}

]};
    var myChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {scales:{y:{beginAtZero: true}}}
    });
    
    myChart.update();
}

updateDemGraph()

// Draw table
const grid = new gridjs.Grid({
    columns:["day", "demand","inventory","backorders","Arrivals"],
    data:jsonAllData
}).render(document.getElementById("wrapper"))

function updateDataTable(){
    grid.updateConfig({
        data: jsonAllData
    }).forceRender()
   console.log("Updating table...")
}
updateDataTable()
