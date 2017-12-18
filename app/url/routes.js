const router = require('express').Router();
const url = require('./url');
const { domain } = require('../../environment');
const SERVER = `${domain.protocol}://${domain.host}`;


router.get('/:hash', async (req, res, next) => {
  
  const source = await url.getUrl(req.params.hash);
  
  // TODO: Respond accordingly when the hash wasn't found (404 maybe?)
  if(!source) {
    let err = new Error('Shorten Url not found');
    err.status = 404
    next(err);
  }

  // TODO: Hide fields that shouldn't be public
  //no need to hide the field as I will only rend  the original url 
  
  // TODO: Register visit


  // Behave based on the requested format using the 'Accept' header.
  // If header is not provided or is */* redirect instead.
  const accepts = req.get('Accept');

  switch (accepts) {
    case 'text/plain':
      res.end(source.url);
      break;
    case 'application/json':
      res.json({"url":source.url});
      break;
    default:
      res.redirect(source.url);
      break;
  }
});


router.post('/', async (req, res, next) => {

  // TODO: Validate 'req.body.url' presence
  if(!req.body.url) {
    let err = new Error('Url is not valid, please provide valid url');
    err.status = 400
    next(err);
  }


  try {
    let shortUrl = await url.shorten(req.body.url, url.generateHash(req.body.url));
    res.json(shortUrl);
  } catch (e) {
    // TODO: Personalized Error Messages
    let err = new Error(e.message);
    err.status = 500;
    next(err);
  }
});


router.delete('/:hash/remove/:removeToken', async (req, res, next) => {

  // TODO: Remove shortened URL if the remove token and the hash match
  // let notImplemented = new Error('Not Implemented');
  // notImplemented.status = 501;
  // next(notImplemented);
  
  try{
    
    let deletedUrl =  await url.deleteUrl(req.params.hash,req.params.removeToken);
    
    if(deletedUrl){
    
      let userResponse = {
        url:deletedUrl.url,
        shorten: `${SERVER}/${deletedUrl.hash}`,
      }
      //console.log(deleteval);
      res.status(200).json(userResponse);
    }else {
      res.status(404).json({message:"Shorten Url does not exist"})
    }
    
  } catch (e){
    console.error(e);
    res.status(500).json({error:"Internal error in deleting the shorten url"});
  }
  


});

module.exports = router;
