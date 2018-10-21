'use strict'

//API info form themealdb
const mealBaseURLByname = 'https://www.themealdb.com/api/json/v1/1/search.php';
const mealBaseURLById = 'https://www.themealdb.com/api/json/v1/1/lookup.php';
const mealBaseURLByfilter = 'https://www.themealdb.com/api/json/v1/1/filter.php';
const mealBaseURLList = 'https://www.themealdb.com/api/json/v1/1/list.php?';

//API info from edamam for nutrition analysis
const edamamBaseURL = 'https://api.edamam.com/api/nutrition-data';

//query API by meal ID number
function getMealById(id) {
    const query = {
        i: id
    }
    $.getJSON(mealBaseURLById,query,getNutrition)
}

//query API by ingredient and area 
function filterSearch(ingredient,area) {
    $('.js-result').empty();
    const queryIngredient = {
        i: ingredient
    }
    $.getJSON(mealBaseURLByfilter,queryIngredient,function(mealByIngredient) {
        if (area==='*') {
            //update selection options for area to include avaialble areas when user search with ingredient name but let area blank.
            let areas = [];
            if (mealByIngredient.meals) {
                $('select[class="js-area"]').empty();
                $('select[class="js-area"]').append(`<option value="*">*</option>`);
                mealByIngredient.meals.forEach((meal,index)=> {
                    let queryId = {
                        i: meal.idMeal
                    }
                $.getJSON(mealBaseURLById,queryId,function(mealById) {
                        if (!areas.includes(mealById.meals[0].strArea)) {  
                            areas.push(mealById.meals[0].strArea);
                            $('select[class="js-area"]').append(`<option value="${mealById.meals[0].strArea}">${mealById.meals[0].strArea}</option>`);}
                })
            });
            renderHTML(mealByIngredient)
        }
        else {
            alert('Can find anything. Try something else?')
        } }
        else {
            if (mealByIngredient.meals) {
                let arrayMeals = [];
                mealByIngredient.meals.forEach(meal=> {
                        let queryId = {
                            i: meal.idMeal
                        };
                        //API is missing area info when query it via ingredient name, fix with turning off async and loop query thru each
                        $.ajaxSetup({
                            async: false
                        });
                        $.getJSON(mealBaseURLById,queryId, function(mealById) {
                            if (mealById.meals[0].strArea === area) {
                                arrayMeals.push(meal)
                            }
                        })
                     })
                     let newMeals = {
                        'meals': arrayMeals
                    }
                     if (newMeals.meals.length === 0) {
                         alert('Nothing found with this ingredient and in this area. Try something else pleas')
                     }
                     else {
                        renderHTML(newMeals)
                     }
    } 
        else {
            alert('Nothing found with this ingredient and in this area. Try something else please')
        }
}
    })

}

// get total carlories from API
function getNutrition(result) {
    let ingredientsQuery = [];
    let resultObject = result.meals[0];

    //remove ingredients and measurements that will cause API return incorrect responses
    let filterWords = ['sauce','water','salt', 'lemon','cloves','all spice'];
    let filterMeasurement = ['handful','some', 'cloves', 'dash'];

    Object.keys(resultObject).forEach(keyName=> {
        if (keyName.includes('strIngredient') && resultObject[keyName] && resultObject[keyName] !== null && !filterWords.find(word => resultObject[keyName].toLowerCase().includes(word))) {
            let num = keyName.split('').filter(each=> !isNaN(each)).join('');
            // ingredientsHTML.push(`<li><span class="${meal["strIngredient"+num]}">${meal["strMeasure"+num]}</span> <span class="${meal["strIngredient"+i]}">${meal["strIngredient"+i]}</span>`)
            if (!filterMeasurement.find(measure => resultObject['strMeasure'+num].toLowerCase().includes(measure))) {
                ingredientsQuery.push(`${resultObject['strMeasure'+num]} ${resultObject[keyName]}`)
            }
        }
    });
    const query = {
        app_id: '5de699c2',
        app_key: '0be18ee23172028232a8ec8b5d419896',
        ingr: ingredientsQuery.join(' and ')
    }
    $.getJSON(edamamBaseURL,query,function(data){
        renderHTMLDetail(data,resultObject)})
}

//get all available areas from API and update selection options
function getMealsAreas() {
    const query = {
        a: 'list'
    }
    $.getJSON(mealBaseURLList,query,function(areas) {
        $('select[class="js-area"]').append(`<option value="*">*</option>`);
        areas.meals.map(area=>area.strArea).sort().forEach(area=>$('select[class="js-area"]').append(`<option value="${area}">${area}</option>`))
    })
}

//query API by meal name
function getMealByName(keyword) {
    $('.js-result').empty();
    const query = {
        s: keyword
    };
    $.getJSON(mealBaseURLByname,query,renderHTML)
}

//Update result to user
function renderHTML(result) {
    if(result.meals !==undefined && result.meals.length === 1) {
        $('header[class="mainHeader"]').prop('hidden',true);
        $('.result').prop('hidden',false);
        $('.search').prop('hidden',true);
        $('section[class="searchArea"]').append(`<button class="fas fa-search searchIcon fa-1x" aria-label="click to search again" title="click to search again"></button>`);
        $('section[class="searchArea"]').css({'top':'2px','bottom':'unset','width':'45px','height':'unset', 'border':'unset'});
        $('.searchIcon').prop('hidden', false);
        if (!result.meals[0].strArea) {
            let query = {
                i: result.meals[0].idMeal
            }
            $.getJSON(mealBaseURLById,query,function(data){
                $('.js-result').append(`<section class="meal" id="${result.meals[0].idMeal}">
                <div class="mealDescription">
                <header role="banner">
                    <h3><a href="#" class="link">${result.meals[0].strMeal}</a></h3>
                </header>
                <p><span class="region">Region:</span> ${result.meals[0].strArea}</p>
                </div><div class="finalPicture link">
                <img src="${result.meals[0].strMealThumb}" alt="" class="${result.meals[0].idMeal}">
                </div>
                <nav role="navigation">
                <div class="pageNav"><div class="total" class="link">Total 1 meal</div></nav>
                </div>
                </section>`);
            })
        }
        else {
            $('.js-result').append(`<section class="meal" id="${result.meals[0].idMeal}">
            <div class="mealDescription">
                <header role="banner">
                    <h3><a href="#" class="link">${result.meals[0].strMeal}</a></h3>
                </header>
                <p><span class="region">Region:</span> ${result.meals[0].strArea}</p>
            </div><div class="finalPicture link">
                <img src="${result.meals[0].strMealThumb}" alt="" class="${result.meals[0].idMeal}">
            </div>
            <div class="pageNav"><div class="total">Total 1 meal</div>
            </div>
            </section>`)
        }
        catchMealClick();
        searchIconClick()
    }
    else if (result.meals !==undefined && result.meals.length > 1) {
        $('header[class="mainHeader"]').prop('hidden',true);
        $('.result').prop('hidden',false);
        $('.search').prop('hidden',true);
        $('section[class="searchArea"]').append(`<button class="fas fa-search searchIcon fa-1x" aria-label="click to search again" title="click to search again"></button>`);
        $('section[class="searchArea"]').css({'bottom':'unset','width':'15px','height':'unset'});
        const resultArray = result.meals.map(meal=> 
            {if (meal.strArea === undefined) {
                let query = {
                    i: meal.idMeal
                }
                $.ajaxSetup({
                    async: false
                });
                $.getJSON(mealBaseURLById,query,function(data){
                    meal.strArea = data.meals[0].strArea;
                })};
                return `<section class="meal" id="${meal.idMeal}">
            <div class="mealDescription">
                <header role="banner">
                    <h3><a href="#" class="link">${meal.strMeal}</a></h3>
                </header>
                <p><span class="region">Region:</span> ${meal.strArea}</p>
            </div><div class="finalPicture link">
                <img src="${meal.strMealThumb}" alt="" class="${meal.idMeal}">
            </div>
            <div class="pageNav"></div>
            </section>`}    )
            const index = 0
            $('.js-result').append(resultArray[index]);
            $('.pageNav').append(`<div class="total" role="presentation">Total ${resultArray.length} meals</div>`);
            $('.pageNav').append(`<div class="next"><button class="fas fa-chevron-right fa-3x" aria-label="Next result" title="Next result"></button></div>`)
            pageNav(resultArray,index);
            catchMealClick();
            searchIconClick()
    }
    else {
        alert("Can't find anything with that name. Try something else?")
    }
}

//resume search box
function searchIconClick() {
    $('.searchArea').on('click', '.searchIcon', event=>{
        $('section[class="searchArea"]').css({'bottom':'','width':'','height':'','left':''});
        $('.search').prop('hidden',false);
        $('.js-result').empty();
        $('.searchIcon').remove();
    })
}

//navigate through result pages
function pageNav(resultArray,index) {
    let total = resultArray.length;
    $('.pageNav').on('click', '.next', event=> {
        index ++;
        if (index < total && index - 1 >=0) {
            $('.js-result').empty();
        $('.js-result').append(resultArray[index]).slideDown(600);
        $('.pageNav').append(`<div class="pre"><button class="fas fa-chevron-left fa-3x" aria-label="Previous result" title="Previous result"></button></a></div>`)
        $('.pageNav').append(`<div class="total" role="presentation">Total ${total} meals - ${index+1}/${total}</div>`)
        if (index+1 < total) {
            $('.pageNav').append(`<div class="next "><button class="fas fa-chevron-right fa-3x" aria-label="Next result" title="Next result"></button></div>`)
        }
        pageNav(resultArray,index)
        }
    })
    $('.pageNav').on('click', '.pre', event=> {
        if (index < total && index - 1 >=0) {
        index --;
        $('.js-result').empty();
        $('.js-result').append(resultArray[index]).slideDown(600);
            if (index >0) {
                $('.pageNav').append(`<div class="pre"><button class="fas fa-chevron-left fa-3x" aria-label="Previous result" title="Previous result">Previous result</button></a></div>`)
            }
        $('.pageNav').append(`<div class="total" aria-live="assertive" role="presentation">Total ${total} meals - ${index+1}/${total}</div>`)
        $('.pageNav').append(`<div class="next "><button class="fas fa-chevron-right fa-3x" aria-label="Next result" title="Next result"></button></div>`)
        pageNav(resultArray,index);
            
        }
    })
}

function renderHTMLDetail(result,resultObject) {

    //if calories return 0, replace it with * instead
    if (result.calories === 0) {
        result.calories = '*'
    }
    
    const calories = result.calories;
    const mealName = resultObject.strMeal;
    const mealId = resultObject.idMeal;
    const area = resultObject.strArea;
    const image = resultObject.strMealThumb;
    const instruction = resultObject.strInstructions.replace(/(\r\n\r\n)/gm,'\r\n').split('\r\n').map(step=> `<li>${step}</li>`).join('');
    const video = resultObject.strYoutube.replace('https://www.youtube.com/watch?v=','');
    const ingredientsObject = {};
    Object.keys(resultObject).forEach(keyName=> {
        if (keyName.includes('strIngredient') && resultObject[keyName] && resultObject[keyName] !== null) {
        let num = keyName.split('').filter(each=> !isNaN(each)).join('');
        ingredientsObject[resultObject['strIngredient'+num]] = resultObject['strMeasure'+num];
        }
    });
    let ingredientsHTML = Object.keys(ingredientsObject).map(ingredient=> `${ingredientsObject[ingredient]} ${ingredient}`);
    let completeHTML = `<section class="meal detail" class="${mealId}">
    <div class="mealDescription fullWidth">
    <header role="banner">
    <h3 class="center">${area} ${mealName}</h3><div class="nutrition"><i class="fab fa-nutritionix"></i> Calories: <span class="red">${calories}</span></div>
    </header>
    </div>
    <div class="basicInfo fullWidth">
    <div class="finalPicture imgDetail">
        <img src="${image}" alt="mealName">
        </div>
    <div class="ingredients">
        <ul>${ingredientsHTML.map(each=>`<li>${each}</li>`).join('')}</ul>
    </div>
    </div>
    <div class="instruction fullWidth" hidden></div>
    <div class="instructionSelect fullWidth">
        <div class="textInstruction"><i class="far fa-list-alt fa-3x verticalAlign"></i><button title="Text Instructions" aria-label="Text Instructions">Text Instructions</button></div>
        <div class="videoInstruction"><i class="fab fa-youtube fa-3x verticalAlign"></i><button title="Video Instructions" aria-label="Video Instructions">Video Instructions</button></div>
    </div>
    </section>`;
    $('.js-result').empty();
    $('.js-result').html(completeHTML);
    showInstruction(mealName,instruction,video);
    searchIconClick()
}

function showInstruction(mealName,instruction,videoInstruction) {
    $('.js-result').on('click', '.textInstruction', event=>{
        $('.instruction').html(`<ul>${instruction}</ul>`)
        $('.basicInfo').prop('hidden',true);
        $('.instruction').prop('hidden', false);
        $('.videoInstruction').prop('hidden',false);
        $('.textInstruction').prop('hidden',true);
        $('.nutrition').prop('hidden',false);
     }) 
     $('.js-result').on('click', '.videoInstruction', event=>{
        $('.instruction').html(`<iframe id="video" width="100%" height="350" title="${mealName}" src="https://www.youtube.com/embed/${videoInstruction}?modestbranding=1" frameborder="0" allowfullscreen></iframe>`)
        $('.basicInfo').prop('hidden',true);
        $('.instruction').prop('hidden', false);
        $('.textInstruction').prop('hidden',false);
        $('.videoInstruction').prop('hidden',true);
        $('.nutrition').prop('hidden',true);
     }) 
}
function catchSelection() {
    $('#searchIngredient').on('click', event=> {
        // only fetch data from API only on first run, prevent overloading API server
        if($('select[class="js-area"]').find('option').length === 1) {
            $('select[class="js-area"]').empty();
            getMealsAreas();            
        }
        // show search options based on user's selection
        $('input[id="mealName"]').prop('required', false);
        $('input[id="ingredient"]').prop('required', true);
        $('.filterSearch').prop('hidden', false);
        $('.searchMealName').prop('hidden', true);
    })
    $('#searchMealName').on('click', event=> {

        //show search options based on user's selection
        $('input[id="mealName"]').prop('required', true);
        $('input[id="ingredient"]').prop('required', false);
        $('.filterSearch').prop('hidden', true);
        $('.searchMealName').prop('hidden', false);
    })
}

function catchMealClick() {
    $('.js-result').on('click', '.link', event=> {
        event.preventDefault();
        let id = $(event.currentTarget).closest('section').attr('id');
        getMealById(id);
    })
}
function catchSubmit() {
    catchSelection();
    $('.search').on('submit', event=> {
        event.preventDefault();
        if($('input[id="searchMealName"]').prop('checked')) {
        let keyword = $('input[class="mealName"]').val();
        getMealByName(keyword);
        }
        else if($('input[id="searchIngredient"]').prop('checked')) {
            const ingredient = $('input[id="ingredient"]').val();
            const area = $('select[name="areas"]').val();
            filterSearch(ingredient,area);
        }
    })

}
$(catchSubmit)