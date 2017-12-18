const uuidv4 = require('uuid/v4');
const { domain ,crypt} = require('../../environment');
const SERVER = `${domain.protocol}://${domain.host}`;

const UrlModel = require('./schema');
const parseUrl = require('url').parse;
const validUrl = require('valid-url');
const sha256 = require('sha256');

/**
 * Lookup for existant, active shortened URLs by hash.
 * 'null' will be returned when no matches were found.
 * @param {string} hash
 * @returns {object}
 */
async function getUrl(hash) {
  let source = await UrlModel.findOne({ active: true, hash });
  return source;
}

/**
 * Generate an unique hash-ish- for an URL.
 * TODO: Deprecated the use of UUIDs.
 * TODO: Implement a shortening algorithm
 * @param {string} id
 * @returns {string} hash
 */
function generateHash(url) {
  // return uuidv5(url, uuidv5.URL);
  //return uuidv4();
  return hashTheUrl(url);
}

/**
 * Generate a random token that will allow URLs to be (logical) removed
 * @returns {string} uuid v4
 */
function generateRemoveToken(url) {
  //return uuidv4();
  return hashTheUrl(url + "remove");
}

/**
 * Create an instance of a shortened URL in the DB.
 * Parse the URL destructuring into base components (Protocol, Host, Path).
 * An Error will be thrown if the URL is not valid or saving fails.
 * @param {string} url
 * @param {string} hash
 * @returns {object}
 */
async function shorten(url, hash) {

  if (!isValid(url)) {
    throw new Error('Invalid URL');
  }

  // Get URL components for metrics sake
  const urlComponents = parseUrl(url);
  const protocol = urlComponents.protocol || '';
  const domain = `${urlComponents.host || ''}${urlComponents.auth || ''}`;
  const path = `${urlComponents.path || ''}${urlComponents.hash || ''}`;

  // Generate a token that will alow an URL to be removed (logical)
  const removeToken = generateRemoveToken(url);

  // Create a new model instance
  const shortUrl = new UrlModel({
    url,
    protocol,
    domain,
    path,
    hash,
    isCustom: false,
    removeToken,
    active: true
  });

  let returnValue = {
    url,
    shorten: `${SERVER}/${hash}`,
    hash,
    removeUrl: `${SERVER}/${hash}/remove/${removeToken}`,
    removeToken: `${removeToken}`
  };

  // TODO: Handle save errors
  try{
    const saved = await shortUrl.save();
  } catch(e){

    if(e.name == 'MongoError' & e.code == '11000'){

      returnValue.messsage  = 'Shorten url already existed. Returning the same';
      // delete the removeUrl for security reasons. as the person may not be the onwer of the shorten url
      delete returnValue.removeUrl;
    
    } else throw e;   
       
  }
  

  return returnValue;

}


/**
 * Delete the shorten url
 * @param {String} hash
 * @param {String} removeToken
 * @returns {Boolen} 
 */
async function deleteUrl(hash, removeToken){
  
    return  await UrlModel.findOneAndRemove({'hash':hash,'removeToken':removeToken});
  }


/**
 * Validate URI
 * @param {any} url
 * @returns {boolean}
 */
function isValid(url) {
  return validUrl.isUri(url);
}

/**
 * generate hash based on  URI
 * @param {any} url
 * @returns {String}
 */
function hashTheUrl(urlString) {
  
  let hashValue;
  
      if(!urlString) return false;
  
      // get the sha256 hashing of the given url plus padded secret key
      let sha256HashedUrl =  sha256(urlString + crypt.SECRET);
  
      //A string hashing function based on Daniel J. Bernstein's popular 'times 33' hash algorithm.
      // we are using it to shorten the sha256 hashed string. 
      let hash = 5381;
      let index = sha256HashedUrl.length;
  
      while(index){
  
          hash = (hash * 33) ^ sha256HashedUrl.charCodeAt(--index);
      }
  
      hashValue =  hash >>> 0;
  
      return hashValue.toString(16);
}




module.exports = {
  shorten,
  getUrl,
  generateHash,
  generateRemoveToken,
  isValid,
  deleteUrl
}
