function getEduCard(data)
{
    //create the main card div
    var cardDiv = document.createElement('div')
    cardDiv.className = "educard";


    //create the image div and its content
    var dateDiv = document.createElement('div');
    var date = document.createElement('h3');
    var sepDiv =  document.createElement('div');
    var img = document.createElement('i');

    
    dateDiv.className = "imgdiv";
    $(cardDiv).append(dateDiv);  //append the date div

    date.textContent = data.date;
    $(dateDiv).append(date);

    sepDiv.className = "sepdiv";
    $(cardDiv).append(sepDiv);  //append the bookmark div

    //add the bookmark
    img.className = "fa fa-bookmark";
    $(sepDiv).append(img);


    //create the title and summary
    var contentDiv = document.createElement('div');
    var title = document.createElement('h3');
    var summary = document.createElement('p');
    var result = document.createElement('p');

    //add the content div to the main card
    contentDiv.className = "contentdiv";
    $(cardDiv).append(contentDiv);

    //add the title
    title.textContent = data.institute;
    $(contentDiv).append(title);

    //add the summary
    var tmp = document.createElement('div');
    tmp.style.overflowY = "auto";
    
    
    summary.textContent = data.details;
    result.textContent = data.result;

    tmp.className = "summarydiv";
    $(tmp).append(summary);
    $(tmp).append(result);

    $(contentDiv).append(tmp);

    
    //return the overall div
    return cardDiv;
}

function showEducation()
{
    var isEmpty = document.getElementById("education").children.length;
    //console.log(isEmpty);
    if(isEmpty==0){
        for(var i=0; i<education.length; i++)
        {
            $('#education').append(getEduCard(education[i]));
        }
    }
}