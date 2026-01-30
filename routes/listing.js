const express=require('express')

const router=express.Router();
const wrapAsync=require('../util/wrapAsync')
const ExpressError=require('../util/ExpressError')
const {listingSchema,reviewSchema} = require("../schema");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    
    if (error) {
        const errmsg = error.details
            .map(el => el.message)
            .join(', ');
        
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};

const validaterReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    console.log(error)
    
    if (error) {
        const errmsg = error.details
            .map(el => el.message)
            .join(', ');
        
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
};



router.post('/listings', validateListing,wrapAsync(async (req, res, next) => {
  // Validate the request body using Joi
   // Note: .listing because req.body = { listing: { ... } }
    // const result=listingSchema.validate(req.body);
    // console.log('masom',result)
    // if(result.error){
    //     throw new ExpressError(400,result.error)

    // }



 
  const newListing = new Listing(req.body.listing);
  
  await newListing.save();

  // Redirect on success
  res.redirect("/list");
}));
 
app.get('/listings/:id/edit',wrapAsync(async(req,res)=>{
    let {id}=req.params
    console.log(id)
    let listing= await Listing.findById(id) 
    console.log(listing)
    res.render('./listings/edit.ejs',{listing})
}))


app.put('/listings/:id',validateListing,wrapAsync(async (req,res)=>{
    //    if(!req.body.listing){ //why it check for if data is not inside body how to data will update or 
    //     throw new ExpressError(400,'send valid datafor listing')
    // }
    let {id}=req.params
    let {listing}=req.body
    console.log(listing)

    await Listing.findByIdAndUpdate(id, listing)
     res.redirect("/list");

})
)
module.exports=listing