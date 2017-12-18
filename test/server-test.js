'use strict';

process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const expect = chai.expect;
const server = require('../app');
chai.use(chaiHttp);

let serverResponse;
const originalUrl = "https://www.facebook.com/" + Math.floor(Math.random() * 100);

describe('Route Positive test suite',() => {

    let reqObj = {"url":originalUrl}

    it('a valid URL should create url shortner', (done)=> {
        
        chai.request(server).post('/').set('content-type', 'application/json').send(reqObj).end((err,res)=>{
            if(err) done (err);

            res.status.should.equal(200);
            serverResponse  = JSON.parse(res.text);
            console.log(serverResponse);
            done();
        });
    });

    it('A valid shorten url should return the origian URL',(done)=>{

        let postPath = '/'+serverResponse.hash
        //console.log('has value: ',postPath );
        chai.request(server).get(postPath).set('Accept', 'application/json')
                            .end((err,res)=>{
                                
                                if(err) done(err);

                                res.status.should.equal(200);
                                console.log(res.text);
                                JSON.parse(res.text).url.should.equal(serverResponse.url);
                                
                                done();
                            });
    });

    it('a valid url shortner removal url should delete the entry', (done)=>{
        let deletePath = '/'+serverResponse.hash + '/remove/' + serverResponse.removeToken;
        console.log('deletePath',deletePath);
        chai.request(server).delete(deletePath).set('content-type', 'application/json')
        .end((err,res)=>{
            if(err) done(err);

            res.status.should.equal(200);
            console.log(res.text);
            done();
        });
    });

});

describe('Route Negative test suite', () => {

    it('Without hash value should throw error', (done) => {

        chai.request(server).get('/').set('content-type', 'application/json').send().end((err,res)=>{
            if(err){
                err.status.should.equal(404)
                done()
            }else {
                done(new Error('Should throw not found error'));
            }
                   
        });
              
    });

    it('invalid hash value should send error as not found',(done) => {

        chai.request(server).get('/X123XA').set('content-type', 'application/json').send().end((err,res) =>{
            expect(err).to.be.an('error');
            res.status.should.equal(404)
            //res.text.message.should.equal('Shorten Url not found"');
            //console.log(err.status);
            //console.log(res.text.message);
            done();
        });
    });

    
    it('should throw 404 when sending delete request for deleted shorten url', (done)=>{
        
        let deletePath = '/'+serverResponse.hash + '/remove/' + serverResponse.removeToken;
        console.log('deletePath',deletePath);
        
        chai.request(server).delete(deletePath).set('content-type', 'application/json')
        .end((err,res)=>{

            if(err){
                res.status.should.equal(404);
                console.log(res.text);
                done();
            } else {
                done(new Error('Should throw 404 error'));
            }

            
            
            
        });
    });


});