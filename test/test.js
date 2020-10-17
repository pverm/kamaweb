var server   = require('../bin/www');
var chai     = require('chai');
var expect   = chai.expect;
var request  = require('request');
var cheerio  = require('cheerio');
var base_url = 'http://localhost:8080';
chai.use(require('chai-json-schema'));

process.env.NODE_ENV = 'test'

describe("ROUTING", function() {

  before(function () {
    server.start();
  });


  describe("/", function() {
    it("returns status code 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        done();
      });
    });

    it("returns express title", function(done) {
      request.get(base_url, function(error, response, body) {
        var $ = cheerio.load(body);
        expect($('title').text()).to.equal('Express');
        done();
      });
    });
  });



  /**
   * memo routes
   */
  describe("/memo", function() {
    it("returns ayy lmao", function(done) {
      request.get(`${base_url}/memo`, function(error, response, body) {
        expect(body).to.equal('ayy lmao');
        done();
      });
    });
  });



  /**
   * log routes
   */
  describe("/log", function() {
    it("returns status code 200", function(done) {
      request.get(`${base_url}/log`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done()
      });
    });
  });



  describe("/log", function() {
    it("returns status code 200", function(done) {
      request.get(`${base_url}/log`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done()
      });
    });

    it("returns serverlist title", function(done) {
      request.get(`${base_url}/log`, function(error, response, body) {
        var $ = cheerio.load(body);
        expect($('title').text()).to.equal('server list');
        done();
      });
    });
  });



  describe("/log/server/<id>", function() {
    it("returns status code 200 for existing server", function(done) {
      request.get(`${base_url}/log/server/1`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done()
      });
    });

    it("returns status code 404 for nonexisting server", function(done) {
      request.get(`${base_url}/log/server/23231`, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done()
      });
    });

    it("returns status code 404 for nonexisting server (not number)", function(done) {
      request.get(`${base_url}/log/server/qweqs`, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done()
      });
    });

    it("returns channellist title", function(done) {
      request.get(`${base_url}/log/server/1`, function(error, response, body) {
        var $ = cheerio.load(body);
        expect($('title').text()).to.equal('channel list');
        done();
      });
    });
  });



  describe("/log/channel/<id>", function() {
    it("returns status code 200 for existing channel", function(done) {
      request.get(`${base_url}/log/channel/1`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done()
      });
    });

    it("returns status code 404 for nonexisting channel", function(done) {
      request.get(`${base_url}/log/channel/23231`, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done()
      });
    });

    it("returns status code 404 for nonexisting channel (not number)", function(done) {
      request.get(`${base_url}/log/channel/qweqs`, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done()
      });
    });

    it("returns datelist title", function(done) {
      request.get(`${base_url}/log/channel/1`, function(error, response, body) {
        var $ = cheerio.load(body);
        expect($('title').text()).to.equal('date list');
        done();
      });
    });
  });



  describe("/log/channel/<id>/latest", function() {
    it("returns status code 200 for existing channel", function(done) {
      request.get(`${base_url}/log/channel/1/latest`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done()
      });
    });

    it("returns status code 404 for nonexisting channel", function(done) {
      request.get(`${base_url}/log/channel/23231/latest`, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done()
      });
    });

    it("returns chatlog title", function(done) {
      request.get(`${base_url}/log/channel/1/latest`, function(error, response, body) {
        var $ = cheerio.load(body);
        expect($('title').text()).to.equal('chatlog');
        done();
      });
    });
  });



  describe("/log/stats/<id>/search", function() {
    it("returns status code 200 for existing channel", function(done) {
      request.get(`${base_url}/log/channel/1/stats`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done()
      });
    });

    it("returns status code 404 for nonexisting channel", function(done) {
      request.get(`${base_url}/log/channel/23231/search`, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done()
      });
    });

    it("returns search title", function(done) {
      request.get(`${base_url}/log/channel/1/search`, function(error, response, body) {
        var $ = cheerio.load(body);
        expect($('title').text()).to.equal('search');
        done();
      });
    });
  });



  describe("/log/stats/<id>/stats", function() {
    it("returns status code 200 for existing channel", function(done) {
      request.get(`${base_url}/log/channel/1/stats`, function (error, response, body) {
        expect(response.statusCode).to.equal(200);
        done()
      });
    });

    it("returns status code 404 for nonexisting channel", function(done) {
      request.get(`${base_url}/log/channel/23231/stats`, function (error, response, body) {
        expect(response.statusCode).to.equal(404);
        done()
      });
    });

    it("returns JSON data for valid chartData index", function(done) {
      request.get(`${base_url}/log/channel/2/stats?chartData=1`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        done()
      });
    });

    var numNickSchema = {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["num", "nick"],
        "properties": {
          "num": {
            "type": "string"
          },
          "nick": {
            "type": "string"
          }
        }
      }
    }

    var numPostedAtDateSchema = {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["num", "postedAtDate"],
        "properties": {
          "num": {
            "type": "string"
          },
          "postedAtDate": {
            "type": "string"
          }
        }
      }
    }

    it("returns status code 404 for invalid chartData index", function(done) {
      request.get(`${base_url}/log/channel/2/stats?chartData=abs`, function(error, response, body) {
        expect(response.statusCode).to.equal(404);
        done()
      });
    });

    it("returns valid JSON schema for chartData index 1", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=1`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema(numNickSchema);
        done()
      });
    });

    it("returns valid JSON schema for chartData index 2", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=2`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema({
          "type": "array",
          "items": {
            "type": "object",
            "required": ["num", "postedAtDate", "nick"],
            "properties": {
              "num": {
                "type": "string"
              },
              "postedAtDate": {
                "type": "string"
              },
              "nick": {
                "type": "string"
              }
            }
          }
        });
        done()
      });
    });

    it("returns valid JSON schema for chartData index 3", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=3`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema({
          "type": "array",
          "items": {
            "type": "object",
            "required": ["h", "count"],
            "properties": {
              "h": {
                "type": "number",
                "minimum": 0,
                "maximum": 23
              },
              "count": {
                "type": "string"
              }
            }
          }
        });
        done()
      });
    });

    it("returns valid JSON schema for chartData index 4", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=4`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema(numNickSchema);
        done()
      });
    });

    it("returns valid JSON schema for chartData index 5", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=5`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema({
          "type": "array",
          "items": {
            "type": "object",
            "required": ["domain_name", "count"],
            "properties": {
              "domain_name": {
                "type": "string"
              },
              "count": {
                "type": "string"
              }
            }
          }
        });
        done()
      });
    });

    it("returns valid JSON schema for chartData index 6", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=6`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema(numPostedAtDateSchema);
        done()
      });
    });

    it("returns valid JSON schema for chartData index 7", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=7`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema(numNickSchema);
        done()
      });
    });

    it("returns valid JSON schema for chartData index 8", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=8`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema(numNickSchema);
        done()
      });
    });

    it("returns valid JSON schema for chartData index 9", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=9`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema({
          "type": "array",
          "items": {
            "type": "object",
            "required": ["len", "nick"],
            "properties": {
              "len": {
                "type": "string"
              },
              "nick": {
                "type": "string"
              }
            }
          }
        });
        done()
      });
    });

    it("returns valid JSON schema for chartData index 11", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=11`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema(numPostedAtDateSchema);
        done()
      });
    });

    it("returns valid JSON schema for chartData index 12", function(done) {
      request.get(`${base_url}/log/channel/1/stats?chartData=12`, function(error, response, body) {
        expect(response.statusCode).to.equal(200);
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
        expect(JSON.parse(body)).to.be.jsonSchema({
          "type": "array",
          "items": {
            "type": "object",
            "required": ["count", "nick"],
            "properties": {
              "len": {
                "type": "string"
              },
              "nick": {
                "type": "string"
              }
            }
          }
        });
        done()
      });
    });

  });


  after(function () {
    server.shutdown();
  });

});
