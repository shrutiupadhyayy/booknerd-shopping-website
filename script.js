const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');


//*cart
let cart = [];
//buttons
let buttonsDOM = [];

//*for getting the products
class Products {
    async getProducts(){
        try {
       let result = await fetch('products.json');
       let data = await result.json();
       let products = data.items //we have both object and property
       //running map method on the array
       products = products.map(item => {
           const {title,price} = item.fields;//getting data and price
           const {id} = item.sys
           const image = item.fields.image.fields.file.url;
           return {title,price,id,image}
       })
        return products
        } catch (error) {
            console.log(error);
        }     
        //*async await will always return the promise so we can always use chaining of .then and also await, will be waiting until the promise is settled and then will return the result

    }        
}

//*displaying the products
class UI {
displayProducts(products){
    let result = ' ';
    products.forEach(product => {
        result += `
        <!--single product-->
        <article class="product">
        <div class="img-container">
            <img src = ${product.image} 
            alt="product" 
            class="product-img"
            width= "355"
            height = "400">
            <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>
                Add to cart
            </button>
        </div> 
         <h3>${product.title}</h3>
         <h4>₹${product.price}</h4>
        </article>
        <!--end of single product-->
        `;
        //*we are getting the info from the products then we use the UI display products method where we get an array 
    });
    productsDOM.innerHTML = result;
}
 getBagButtons() {   
 const buttons = [...document.querySelectorAll('.bag-btn')]; 
 buttons.forEach(button => {
     let id = button.dataset.id;
     let inCart = cart.find(item => item.id === id);//*now we have the id we can set up the variable, since its an array and its empty, use FIND method and find the item of its in the cart
     if(inCart){
         button.innerHTML = "In Cart";
         button.disabled = true;
     } else {
         button.addEventListener('click', event=>{
             event.target.innerHTML = "In Cart";
             event.target.disabled = true;
             //*all  methods
             //get the product from products
             let cartItem = {...Storage.getProduct(id), amount: 1};
            
             //add the product to the cart
             cart = [...cart, cartItem]; //get all the items in the cart

             //save cart in the local storage
             Storage.saveCart(cart)

             //set cart values, number of items in the cart 
            this.setCartValues(cart);

             //display the cart items in cart
            this.addCartItem(cartItem);

             //SHOW THE CART
             this.showCart();
         });   
        }        
 });
 }
 setCartValues(cart){
     let tempTotal = 0;
     let itemsTotal = 0;
     cart.map(item=> {
         tempTotal += item.price * item.amount;
         itemsTotal += item.amount;
     });
     cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
     cartItems.innerText = itemsTotal;
     //console.log(cartTotal, cartItems);
 }
 addCartItem(item){
     const div = document.createElement('div');
     div.classList.add('cart-item');
     div.innerHTML = `<img src=${item.image}
      alt="product"/>
     <div>
         <h4>${item.title}</h4>
         <h5>₹${item.price}</h5>
         <span class="remove-item" data-id=${item.id}>remove</span>
     </div>
     <div>
         <i class="fas fa-chevron-up" data-id=${item.id}></i>
         <p class="item-amount">${item.amount}</p>
         <i class="fas fa-chevron-down" data-id=${item.id}></i>
     </div>
     `;  
     cartContent.appendChild(div);
 }
 showCart() {
     cartOverlay.classList.add('transparentBcg');
     cartDOM.classList.add('showCart');
 } 
setupAPP (){
    cart = Storage.getCart();//updateing the cart from local storage
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click',this.showCart);
    closeCartBtn.addEventListener('click',this.hideCart);
}
populateCart(cart){
    cart.forEach(item => this.addCartItem(item));
}
hideCart(){
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
}
cartLogic(){
   clearCartBtn.addEventListener('click', ()=> {
       this.clearCart();
   }); 
//*cart functionality   
cartContent.addEventListener('click', event=> {
    if(event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild
        (removeItem.parentElement.parentElement);
        this.removeItem(id);
    }
    //for increase and decrease
    else if(event.target.classList.contains("fa-chevron-up")){
        let addAmount = event.target;
        let id = addAmount.dataset.id;
         let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;  
    } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if(tempItem.amount > 0){
        Storage.saveCart(cart);
        this.setCartValues(cart);
        lowerAmount.previousElementSibling.innerText = tempItem.amount;
        }
        else{
            cartContent.removeChild(lowerAmount.parentElement.parentElement);
            this.removeItem(id);
        }
    }

});
}
clearCart(){
    //*clear cart button
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id))
    //creates an array of all the particular ids in the cart and loop over the array and use each and every item thats in the array with a method of remove item
    while(cartContent.children.length>0){ //if DOM has any kind of children, they need to be removed
    cartContent.removeChild(cartContent.children[0])    
    }
    this.hideCart();
}
removeItem(id){ //filter or remove all the items that dont have the id
    cart = cart.filter(item => item.id !==id);//updates the cart and gets all the ids and for all of that remove these items
    //* cart values should also change when something is removed
    this.setCartValues(cart);
    Storage.saveCart(cart);
    //update the button because once you reset the values you want ADD TO BAG after clearing the cart
    let button = this.getSingleButton(id);  
    button.disabled = false;
   button.innerHTML = `<i class= "fas fa-shopping-cart"></i>Add to cart`;   
}
getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id === id); // will get the specific button that was used to add the item in the cart
}
}

//*local storage
class Storage{
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct (id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart',JSON.stringify(cart))
    }
    static getCart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    const ui = new UI();
    const products = new Products();
    //setup app
    ui.setupAPP();
    //*get all products
    products.getProducts().then(products=> {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(()=>{
        ui.getBagButtons();
        ui.cartLogic();
    });
});