function getResearchCard(data)
{
    //create the main card div
    var cardDiv = document.createElement('div')
    cardDiv.className = "researchcard";


    //create the image div and its content
    var imgDiv = document.createElement('div');
    var img = document.createElement('img');
    var pdfBtn = document.createElement('button');
    var doiBtn = document.createElement('button');
    var demoBtn = document.createElement('button');

    imgDiv.className = "imgdiv";
    $(cardDiv).append(imgDiv);  //append the imgdiv

    //add the image
    img.src = data.img;
    $(imgDiv).append(img);
    // add the image zoom in callback
    /*
    $(img).on('click',function(e){
        e.preventDefault();
        this.style.width = "80vw";
    });
    */

    //append pdf link
    pdfBtn.textContent = "PDF";
    pdfBtn.onclick = function(){window.open(data.pdf, "_blank");};
    $(imgDiv).append(pdfBtn);

    //append doi link
    doiBtn.textContent = "DOI";
    doiBtn.onclick = function(){window.open(data.doi, "_blank");};
    $(imgDiv).append(doiBtn);

    //check if it has demo .hasOwnProperty('demo')
    if(data.hasOwnProperty('demo'))
    {
        //append demo link
        demoBtn.textContent = "DEMO";
        demoBtn.onclick = function(){window.open(data.demo, "_blank");};
        $(imgDiv).append(demoBtn);
    }


    //create the title and summary
    var contentDiv = document.createElement('div');
    var title = document.createElement('h3');
    var summary = document.createElement('p');

    //add the content div to the main card
    contentDiv.className = "contentdiv";
    $(cardDiv).append(contentDiv);

    //add the title
    title.textContent = data.title;
    $(contentDiv).append(title);

    //add the summary
    var tmp = document.createElement('div');
    tmp.style.overflowY = "auto";
    
    
    summary.textContent = data.abstract;
    tmp.className = "summarydiv";
    $(tmp).append(summary);
    $(contentDiv).append(tmp);

    
    //return the overall div
    return cardDiv;
}

function showResearch()
{
    var isEmpty = document.getElementById("research").children.length;
    //console.log(isEmpty);
    if(isEmpty==0){
        for(var i=0; i<research.length; i++)
        {
            $('#research').append(getResearchCard(research[i]));
        }
    }
}
