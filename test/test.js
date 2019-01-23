const chai = require('chai');
const expect = chai.expect;
const moduleApp = require('../app');


describe('Unit test: Number of faces per image', function() {
    it('First test case: image with no faces', function() {
        let responseArray = moduleApp.faceAnalysis({
            "images": [
                {
                    "faces": [],
                    "image": "test1.jpg"
                }
            ],
            "images_processed": 1
        });

        expect(responseArray[0]).to.equal(0);
    });


    it('Second test case: image with one face', function() {
        let responseArray = moduleApp.faceAnalysis({
            "images": [
                {
                    "faces": [
                        {
                            "age": {
                                "min": 19,
                                "max": 22,
                                "score": 0.87516654
                            },
                            "face_location": {
                                "height": 323,
                                "width": 276,
                                "left": 397,
                                "top": 148
                            },
                            "gender": {
                                "gender": "FEMALE",
                                "score": 0.9999993
                            }
                        }
                    ],
                    "image": "test2.jpg"
                }
            ],
            "images_processed": 1
        });

        expect(responseArray[0]).to.equal(1);
    });


    it('Third test case: image with two faces', function() {
        let responseArray = moduleApp.faceAnalysis({
            "images": [
                {
                    "faces": [
                        {
                            "age": {
                                "min": 24,
                                "max": 27,
                                "score": 0.9997002
                            },
                            "face_location": {
                                "height": 145,
                                "width": 127,
                                "left": 232,
                                "top": 62
                            },
                            "gender": {
                                "gender": "MALE",
                                "score": 0.999
                            }
                        },
                        {
                            "age": {
                                "min": 28,
                                "max": 31,
                                "score": 0.7906472
                            },
                            "face_location": {
                                "height": 148,
                                "width": 121,
                                "left": 445,
                                "top": 93
                            },
                            "gender": {
                                "gender": "FEMALE",
                                "score": 0.9999993
                            }
                        }
                    ],
                    "image": "test3.jpg"
                }
            ],
            "images_processed": 1
        });

        expect(responseArray[0]).to.equal(2);
    });

});




describe('Unit test: Average age per face', function() {
    it('First test case: image with no faces. Avergae age should be 0', function() {
        let responseArray = moduleApp.faceAnalysis({
            "images": [
                {
                    "faces": [],
                    "image": "test1.jpg"
                }
            ],
            "images_processed": 1
        });

        expect(responseArray[1]).to.equal(0);
    });


    it('Second test case: image with one face. Avergae age should be 21', function() {
        let responseArray = moduleApp.faceAnalysis({
            "images": [
                {
                    "faces": [
                        {
                            "age": {
                                "min": 19,
                                "max": 22,
                                "score": 0.87516654
                            },
                            "face_location": {
                                "height": 323,
                                "width": 276,
                                "left": 397,
                                "top": 148
                            },
                            "gender": {
                                "gender": "FEMALE",
                                "score": 0.9999993
                            }
                        }
                    ],
                    "image": "test2.jpg"
                }
            ],
            "images_processed": 1
        });

        expect(responseArray[1]).to.equal(21);
    });


    it('Third test case: image with two faces. Avergae age should be 26 and 30 respectively', function() {
        let responseArray = moduleApp.faceAnalysis({
            "images": [
                {
                    "faces": [
                        {
                            "age": {
                                "min": 24,
                                "max": 27,
                                "score": 0.9997002
                            },
                            "face_location": {
                                "height": 145,
                                "width": 127,
                                "left": 232,
                                "top": 62
                            },
                            "gender": {
                                "gender": "MALE",
                                "score": 0.999
                            }
                        },
                        {
                            "age": {
                                "min": 28,
                                "max": 31,
                                "score": 0.7906472
                            },
                            "face_location": {
                                "height": 148,
                                "width": 121,
                                "left": 445,
                                "top": 93
                            },
                            "gender": {
                                "gender": "FEMALE",
                                "score": 0.9999993
                            }
                        }
                    ],
                    "image": "test3.jpg"
                }
            ],
            "images_processed": 1
        });

        expect(responseArray[1]).to.equal(26);
        expect(responseArray[2]).to.equal(30);
    });

});