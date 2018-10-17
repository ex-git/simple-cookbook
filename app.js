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
        }
        }
        else {
            if (mealByIngredient.meals) {mealByIngredient.meals.forEach((meal,index)=> {
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
    else {
        alert('Nothing found with this ingredient and in this area. Try something else please')
    }}
    })

}
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

// function getMealsAreas() {
//     const query = {
//         a: 'list'
//     }
//     $.getJSON(mealBaseURLList,query,function(areas) {
//         $('select[class="js-area"]').append(`<option value="*">*</option>`);
//         areas.meals.map(area=>area.strArea).sort().forEach(area=>$('select[class="js-area"]').append(`<option value="${area}">${area}</option>`))
//     })
// }

// function getAllMealsIngredients() {
//     const query = {
//         i: 'list'
//     }
//     $.getJSON(mealBaseURLList,query,function(ingredients) {
//         $('select[class="js-ingredient"]').append(`<option value="*">*</option>`);
//         ingredients.meals.map(ingredient=>ingredient.strIngredient).sort().forEach(ingredient=>$('select[class="js-ingredient"]').append(`<option value="${ingredient}">${ingredient}</option>`))
//     })
// }

function getMealByName(keyword) {
    $('.js-result').empty();
    const query = {
        s: keyword
    };
    $.getJSON(mealBaseURLByname,query,renderHTML)
}

function renderHTML(result) {
    if(result.meals !==null && result.meals.length === 1) {
        $('header[class="mainHeader"]').prop('hidden',true);
        $('section[class="searchArea"]').css({'left':'unset','top':'unset'});
        $('.result').prop('hidden',false);
        $('.js-result').append(`<section class="meal" id="${result.meals[0].idMeal}">
        <div class="mealDescription">
            <header role="banner">
                <h3>${result.meals[0].strMeal}</h3>
            </header>
            <p><span class="region">Region:</span> ${result.meals[0].strArea}</p>
        </div><div class="finalPicture">
            <img src="${result.meals[0].strMealThumb}" alt="" class="${result.meals[0].idMeal}">
        </div>
        <div class="pageNav"><div class="total">Total 1 result</div>
        </div>
        </section>`);
        catchMealClick();
    }
    else if (result.meals !==null && result.meals.length > 1) {
        $('header[class="mainHeader"]').prop('hidden',true);
        $('section[class="searchArea"]').css({'left':'unset','top':'unset'});
        $('.result').prop('hidden',false);
        const resultArray = result.meals.map(meal=> `<section class="meal" id="${meal.idMeal}">
            <div class="mealDescription">
                <header role="banner">
                    <h3>${meal.strMeal}</h3>
                </header>
                <p><span class="region">Region:</span> ${meal.strArea}</p>
            </div><div class="finalPicture">
                <img src="${meal.strMealThumb}" alt="" class="${meal.idMeal}">
            </div>
            <div class="pageNav"></div>
            </section>`)
            const index = 0
            $('.js-result').append(resultArray[index]);
            $('.pageNav').append(`<div class="total">Total ${resultArray.length} results</div>`);
            $('.pageNav').append(`<div class="next"><i class="fas fa-chevron-right fa-5x"></i></div>`)
            pageNav(resultArray,index);
            catchMealClick()
            
    }
    else {
        alert("Can't find anything with that name. Try something else?")
    }
}

function pageNav(resultArray,index) {
    let total = resultArray.length;
    $('.pageNav').on('click', '.next', event=> {
        index ++;
        if (index < total && index - 1 >=0) {
            $('.js-result').empty();
        $('.js-result').append(resultArray[index]).slideDown(600);
        $('.pageNav').append(`<div class="pre"><i class="fas fa-chevron-left fa-5x"></i></div>`)
        $('.pageNav').append(`<div class="total">Total ${total} results, you are viewing #${index+1}</div>`)
        if (index+1 < total) {
            $('.pageNav').append(`<div class="next "><i class="fas fa-chevron-right fa-5x"></i></div>`)
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
                $('.pageNav').append(`<div class="pre "><i class="fas fa-chevron-left fa-5x"></i></div>`)
            }
        $('.pageNav').append(`<div class="total">Total ${total} results, you are viewing #${index+1}</div>`)
        $('.pageNav').append(`<div class="next "><i class="fas fa-chevron-right fa-5x"></i></div>`)
        pageNav(resultArray,index);
            
        }
    })
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

    let completeHTML = `<section class="meal detail" class="${mealId}"><header role="banner">
    <h3 class="center">${area} ${mealName}</h3><span class="nutrition"><i class="fab fa-nutritionix"></i> Calories: ${calories}</span>
    </header>
    <div class="basicInfo">
    <div class="finalPicture left">
        <img src="${image}" alt="mealName">
        </div>
    <div class="ingredients">
        <ul>${ingredientsHTML.map(each=>`<li>${each}</li>`).join('')}</ul>
    </div>
    </div>
    <div class="instruction" hidden></div>
    <div class="instructionSelect">
        <span class="textInstruction"><i class="far fa-list-alt fa-3x"></i> Text Instructions</span>
        <span class="videoInstruction"><i class="fab fa-youtube fa-3x"></i>Video Instructions</span>
    </div>
    </section>`;
    $('.js-result').empty();
    $('.js-result').html(completeHTML);
    showInstruction(instruction,video);
}

function showInstruction(instruction,videoInstruction) {
    $('.js-result').on('click', '.textInstruction', event=>{
        $('.instruction').html(`<ul>${instruction}</ul>`)
        $('.basicInfo').prop('hidden',true);
        $('.instruction').prop('hidden', false);
        $('.videoInstruction').prop('hidden',false);
        $('.textInstruction').prop('hidden',true);
        $('.nutrition').prop('hidden',false);
     }) 
     $('.js-result').on('click', '.videoInstruction', event=>{
        $('.instruction').html(`<iframe id="video" width="100%" height="350" src="https://www.youtube.com/embed/${videoInstruction}?modestbranding=1" frameborder="0" allowfullscreen></iframe>`)
        $('.basicInfo').prop('hidden',true);
        $('.instruction').prop('hidden', false);
        $('.textInstruction').prop('hidden',false);
        $('.videoInstruction').prop('hidden',true);
        $('.nutrition').prop('hidden',true);
     }) 
}
function catchSelection() {
    $('#searchIngredient').on('click', event=> {
        //only fetch data from API only on first run, prevent overloading API server
        // if($('select[class="js-area"]').find('option').length === 0) {
        //     $('select[class="js-area"]').empty();
        //     getMealsAreas();            
        // }
        
        // if ($('select[class="js-ingredient"]').find('option').length === 0) {
        //     $('select[class="js-ingredient"]').empty();
        //     getAllMealsIngredients();
        // }

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
    $('.js-result').on('click', '.mealDescription', event=> {
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
            const ingredient = $('input[id="ingredients"]').val();
            const area = $('select[name="areas"]').val();
            filterSearch(ingredient,area);
        }
    })

}
$(catchSubmit)