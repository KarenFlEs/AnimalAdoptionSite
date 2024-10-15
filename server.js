const express = require('express'); 
const session = require('express-session'); 
const bodyParser = require('body-parser'); 
const fs = require('fs'); 
const path = require('path'); 
const ejs = require('ejs')

const app = express(); 
const PORT = 5138; 
const loginFile = path.join(__dirname, 'data', 'login.txt')
const availablePetInfoFile = path.join(__dirname, 'data', 'availablePetInfo.txt')

app.set('view engine', 'ejs'); 

app.use(express.static('public')); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(session({
    secret: 'adoptioncenter-secret', 
    resave: false, 
    saveUninitialized: true
}))

app.use((req, res, next) => {
    ejs.renderFile(path.join(__dirname, 'views', 'partials', 'header.ejs'), {user: req.session.user}, (err, header) => {
        if (err) return res.status(500).send('Error loading header'); 
        ejs.renderFile(path.join(__dirname, 'views', 'partials', 'footer.ejs'), (err, footer) => {
            if (err) return res.status(500).send('Error loading footer'); 
            res.locals.header = header; 
            res.locals.footer = footer;
            res.locals.user = req.session.user;  
            next(); 
        })
    })
})

function readData(filePath, callback){
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return callback(err); 
        const parsedData = data.trim().split('\n').map(line => line.split(':'))
        callback(null, parsedData); 
    })
}

function getNextCounter(callback){
    fs.readFile(availablePetInfoFile, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') return callback(err)
        const counter = data ? data.trim().split('\n').length+1 : 1
        callback(null, counter)
    }); 
}

function getNumAge(age){
    switch(age){
        case '0to4': return petAge => petAge >= 0 && petAge <= 4; 
        case '5to8': return petAge => petAge >= 5 && petAge <= 8; 
        case '9to13': return petAge => petAge >= 9 && petAge <= 13; 
        default: return () => true; 
    }
}

function validUsername(username){
    const userPattern =  /^[a-zA-Z0-9]+$/; 
    return userPattern.test(username)
}

function validPassword(password){
    if (password.length < 4)
        return false; 

    const hasOnlyDigitLetter = /^[a-zA-Z0-9]+$/.test(password); 
    const hasLetter = /[a-zA-Z]/.test(password); 
    const hasDigit = /\d/.test(password)

    return hasOnlyDigitLetter && hasLetter && hasDigit; 
}

app.get('/', (req, res) => {
    fs.readFile(path.join(__dirname, 'views', 'Home.html'), 'utf8', (err, content) => {
        if (err) return res.status(500).send('Error Loading Home Page'); 
        res.send(res.locals.header + content + res.locals.footer)
    })
})

app.get('/browse', (req, res) => {
    fs.readFile(path.join(__dirname, 'views', 'Browse.html'), 'utf8', (err, content) => {
        if (err) return res.status(500).send('Error Loading Browse Page'); 
        res.send(res.locals.header + content + res.locals.footer)
    })
})

app.get('/findDogCat', (req, res) => {
        fs.readFile(path.join(__dirname, 'views', 'FindDogCat.html'), 'utf8', (err, content) => {
            if (err) return res.status(500).send('Error Loading Find Dog/Cat Page'); 
            res.send(res.locals.header + content + res.locals.footer)
        })
})

app.post('/findDogCat', (req, res) => {
    console.log(req.body); 
    const {animal, breed, age, gender, getsAlong=[]} = req.body; 

    const pets = [
        {name: 'Coco', animal: 'Cat', breed: 'Ragdoll', age: 3, gender: 'Female', getsAlong:['other dogs', 'small childrens'], 
            praiseComment: 'Coco is a very calm and patient. He loves to give cuddles!', imageUrl: 'Coco-Ragdoll.jpg'},
        {name: 'Edward', animal: 'Dog', breed: 'German Shepherd', age: 6, gender: 'Male', getsAlong:['other cats'], 
            praiseComment: 'Edward loves to play and is very active. He will give you lots of love!', imageUrl: 'Edward-GermanShepherd.jpg'},
        {name: 'Mani', animal: 'Cat', breed: 'Norwegian Forest', age: 9, gender: 'Female', getsAlong:['other dogs'], 
            praiseComment: 'Mani loves to go outdoors and plays often with leaves in fall!', imageUrl: 'Mani-NorwegianForest.jpg'},
        {name: 'Kiko', animal: 'Dog', breed: 'Beagle', age: 4, gender: 'Male', getsAlong:['other cats', 'small childrens'], 
            praiseComment: 'Kiko loves to go for runs and he will make sure to keep up in shape!', imageUrl: 'Kiko-Beagle.jpg'}
    ]; 

    const ageRangeFilter = getNumAge(age); 

    const filteredPets = pets.filter( pet => {
        const matchesAnimal = !animal || pet.animal === animal; 
        const matchesBreed = !breed ||  breed === 'DoesntMatter' || pet.breed.includes(breed); 
        const matchesAge = !age || age === 'DoesntMatter' || ageRangeFilter(pet.age);  
        const matchesGender = !gender || gender === 'DoesntMatter' || pet.gender === gender; 
        const matchesGetsAlong = !getsAlong || getsAlong.length === 0 || getsAlong.includes('DoesntMatter') || getsAlong.every(option => pet.getsAlong.includes(option)); 

        return matchesAnimal && matchesBreed && matchesAge && matchesGender && matchesGetsAlong; 
    })

    res.render('browse.ejs', {pets: filteredPets}); 
})


app.get('/catCare', (req, res) => {
    fs.readFile(path.join(__dirname, 'views', 'CatCare.html'), 'utf8', (err, content) => {
        if (err) return res.status(500).send('Error Loading Cat Care Page'); 
        res.send(res.locals.header + content + res.locals.footer)
    })
})

app.get('/dogCare', (req, res) => {
    fs.readFile(path.join(__dirname, 'views', 'DogCare.html'), 'utf8', (err, content) => {
        if (err) return res.status(500).send('Error Loading Dog Care Page'); 
        res.send(res.locals.header + content + res.locals.footer)
    })
})

app.get('/createAccount', (req, res) => {
    res.render('createAccount');
})


app.post('/createAccount', (req, res) => {
    console.log('User entered credentials: ', req.body)
    const {username, password} = req.body; 

    if (!validUsername(username) || !validPassword(password))
        return res.render('createAccount', {message: 'Invalid username/password'})

    fs.readFile(loginFile, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server Error'); 
        if (data.split('\n').some(line => line.split(':')[0] === username)){
            return res.render('createAccount', {message: 'Username already exists. Please enter a new one'})
        }
        fs.appendFile(loginFile, `${username}:${password}\n`, (err) => {
            if (err) return res.status(500).send('Server error'); 
            return res.render('createAccount', {message: 'Account Created Successfully. You can log in anytime!'})
        })
    })
})

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const {username, password} = req.body; 

    if (!validUsername(username) || !validPassword(password))
        return res.render('login', {message: 'Invalid username/password'})

    readData(loginFile, (err, userData) => {
        if (err) return res.status(500).send('Server error')
        const user = userData.find(u => u[0] === username && u[1] === password)
        if (user){
            req.session.user = username; 
            return res.redirect('/haveAPetToGive')
        }
        else{
            return res.render('login', {message: 'Login Failed'})
        }
    })
})


app.get('/haveAPetToGive', (req, res) => {
    if (!req.session.user){
        return res.redirect('/login')
    }

    fs.readFile(path.join(__dirname, 'views', 'HavePetToGive.html'), 'utf8', (err, content) => {
        if (err) return res.status(500).send('Error Loading Have A Pet To Give Page'); 
        res.send(res.locals.header + content + res.locals.footer)
    })
})

app.post('/haveAPetToGive', (req, res) => {
    if (!req.session.user){
        return res.redirect('/login')
    }

    const username = req.session.user; 
    const {animal, breed, age, gender, getsAlong, suitableChildren, praiseComment, ownerFamilyName, ownerGivenName, ownerEmail} = req.body; 
    getNextCounter((err, counter) => {
        if (err) return res.status(500).send('Server error'); 
        const petEntry = `${counter}:${username}:${animal}:${breed}:${age}:${gender}:${getsAlong}:${suitableChildren}:${praiseComment}:${ownerFamilyName}:${ownerGivenName}:${ownerEmail}\n`; 
        fs.appendFile(availablePetInfoFile, petEntry, (err) => {
            if (err) return res.status(500).send('Error saving pet info')
            res.redirect('/haveAPetToGive'); 
        })
    })

})

app.get('/contactUs', (req, res) => {
    fs.readFile(path.join(__dirname, 'views', 'ContactUs.html'), 'utf8', (err, content) => {
        if (err) return res.status(500).send('Error Loading Contact Us Page'); 
        res.send(res.locals.header + content + res.locals.footer)
    })
})

app.get('/privacyStatement', (req, res) => {
    fs.readFile(path.join(__dirname, 'views', 'PrivacyStatement.html'), 'utf8', (err, content) => {
        if (err) return res.status(500).send('Error Loading Privacy Page'); 
        res.send(res.locals.header + content + res.locals.footer)
    })
})

app.get('/logout', (req, res) => {
    console.log('Successfully Logout!')
    req.session.destroy()

    fs.readFile(path.join(__dirname, 'views', 'LogOut.html'), 'utf8', (err, content) => {
        if (err) return res.status(500).send('Error Loading log out Page'); 
        res.send(res.locals.header + content + res.locals.footer)
    })
})

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});
