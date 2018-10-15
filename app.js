'use strict'

//API info form themealdb
const mealBaseURLByname = 'https://www.themealdb.com/api/json/v1/1/search.php';
const mealBaseURLById = 'https://www.themealdb.com/api/json/v1/1/lookup.php';
const mealBaseURLByfilter = 'https://www.themealdb.com/api/json/v1/1/filter.php';
const mealBaseURLList = 'https://www.themealdb.com/api/json/v1/1/list.php?';

//API info from edamam for nutrition analysis
const edamamBaseURL = 'https://api.edamam.com/api/nutrition-data';

function getMealById(id) {
    const query = {
        i: id
    }
    $.getJSON(mealBaseURLById,query,getNutrition)
}

function filterSearch(ingredient,area) {
    $('.js-result').empty();
    const queryIngredient = {
        i: ingredient
    }

    $.getJSON(mealBaseURLByfilter,queryIngredient,function(mealByIngredient) {
        if (area==='*') {
            //update selection options
            let areas = [];
            $('select[class="js-area"]').empty();
            $('select[class="js-area"]').append(`<option value="*">*</option>`)
            mealByIngredient.meals.forEach(meal=> {
                let queryId = {
                    i: meal.idMeal
                }
                $.getJSON(mealBaseURLById,queryId,function(mealById) {
                    // if (!$('option[value="mealById.meals[0].strArea"].attr("value")')) {
                        if (!areas.includes(mealById.meals[0].strArea)) {  
                            areas.push(mealById.meals[0].strArea);
                            $('select[class="js-area"]').append(`<option value="${mealById.meals[0].strArea}">${mealById.meals[0].strArea}</option>`);}
                            
                    // }
                })
            });
            renderHTML(mealByIngredient)
        }
        else {
            mealByIngredient.meals.forEach(meal=> {
                let queryId = {
                    i: meal.idMeal
                }
                $.getJSON(mealBaseURLById,queryId,function(mealById) {
                    if (mealById.meals[0].strArea === area) {
                        let arrayMeal = []
                        let objectMeal = {
                            'meals' : arrayMeal
                        }
                        arrayMeal.push(meal)
                        renderHTML(objectMeal)
                    }
            })
            });
        }
    })

}
function getNutrition(result) {
    let ingredientsQuery = [];
    let resultObject = result.meals[0];

    //remove ingredients and measurements that will cause API return incorrect responses
    let filterWords = ['sauce','water','salt', 'lemon'];
    let filterMeasurement = ['handful','some'];

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

function getMealsAreas() {
    const query = {
        a: 'list'
    }
    $.getJSON(mealBaseURLList,query,function(areas) {
        $('select[class="js-area"]').append(`<option value="*">*</option>`);
        areas.meals.forEach(area=>$('select[class="js-area"]').append(`<option value="${area.strArea}">${area.strArea}</option>`))
    })
}

function getAllMealsIngredients() {
    const query = {
        i: 'list'
    }
    $.getJSON(mealBaseURLList,query,function(ingredients) {
        $('select[class="js-ingredient"]').append(`<option value="*">*</option>`);
        ingredients.meals.forEach(ingredient=>$('select[class="js-ingredient"]').append(`<option value="${ingredient.strIngredient}">${ingredient.strIngredient}</option>`))
    })
}

function getMealByName(keyword) {
    $('.js-result').empty();
    const query = {
        s: keyword
    };
    $.getJSON(mealBaseURLByname,query,renderHTML)
}

function renderHTML(result) {
    result.meals.forEach((meal,index)=> {
        $('.js-result').append(`<section class="meal" id="${meal.idMeal}"><header role="banner">
        <h3>${meal.strMeal}</h3>
    </header>
    <div class="finalPicture">
        <img src="${meal.strMealThumb}" alt="" width="300" class="${meal.idMeal}">
    </div>
    </section>`)
    });
    catchMealClick()
}

function renderHTMLDetail(result,resultObject) {
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

    let completeHTML = `<section class="meal" class="${mealId}"><header role="banner">
    <h3>${area} ${mealName}</h3>
    </header>
    <div class="finalPicture">
        <img src="${image}" alt="" width="300" class="${mealId}">
    </div>
    <div class="nutrition">
        <strong>Calories: ${calories}</strong>
    </div>

    <div class="ingredients">
        ${ingredientsHTML.join('<br>')}
    </div>
    <div class="ingredients">
        <ul>${instruction}</ul>
    </div>

    <div class="videoInstruction">
    
  <iframe id="video" width="420" height="315" src="https:////www.youtube.com/embed/${video}?modestbranding=1" frameborder="0" allowfullscreen></iframe>
  </div>
    </section>`;
    $('.js-result').empty();
    $('.js-result').html(completeHTML)
}

function catchSelection() {
    $('#searchIngredient').on('click', event=> {
        //only fetch data from API only on first run, prevent overloading API server
        if($('select[class="js-area"]').find('option').length === 0) {
            $('select[class="js-area"]').empty();
            getMealsAreas();            
        }
        
        if ($('select[class="js-ingredient"]').find('option').length === 0) {
            $('select[class="js-ingredient"]').empty();
            getAllMealsIngredients();
        }

        //show search options based on user's selection
        $('input[id="mealName"]').prop('required', false);
        $('.filterSearch').prop('hidden', false);
        $('.searchMealName').prop('hidden', true);
    })
    $('#searchMealName').on('click', event=> {

        //show search options based on user's selection
        $('input[id="mealName"]').prop('required', true);
        $('.filterSearch').prop('hidden', true);
        $('.searchMealName').prop('hidden', false);
    })
}

function catchMealClick() {
    $('.js-result').on('click', 'section', event=> {
        let id = $(event.currentTarget).attr('id');
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
            const ingredient = $('select[name="ingredients"]').val();
            const area = $('select[name="areas"]').val();
            filterSearch(ingredient,area);
        }
    })

}
$(catchSubmit)