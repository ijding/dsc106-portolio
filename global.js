console.log("IT'S ALIVE!");

function $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
}

// creating the navbox
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1") // if the page is local
  ? "/"                  // Local server
  : "/dsc106-portfolio/";         // GitHub Pages repo name

let pages = [ // array of objects that have the url and title
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'resume.html', title: 'Resume'},
    { url: 'contact/', title: 'Contact'},
    { url: 'https://github.com/ijding', title: 'GitHub'}
];

let nav = document.createElement('nav'); // creates a nav element
document.body.prepend(nav); // appends it at the very beginning of the page

for (let p of pages) { // adds anchor elements for each url at the end of the nav element in a loop
    let url = p.url;
    let title = p.title;

    url = !url.startsWith('http') ? BASE_PATH + url : url; // if url is relative add the base path

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) { // is the link we're adding the current page?
        a.classList.add('current');
    } else if (a.host !== location.host) { // is the link we're adding external?
        a.target = '_blank'
    }

    nav.append(a);
}

// this section of code adds parenthises after the Automatic option in the dropdown that lists which mode auto is in
let colorScheme = window.matchMedia('(prefers-color-scheme: dark)'); //this MediaQueryList object determines whether the current 
let colorText = colorScheme.matches?"Dark":"Light";
colorScheme?.addEventListener('change', function (event) { // whenever the os color scheme changes
    colorText = event.matches?"Dark":"Light"; // Dark if the event matches our mediaquery string (which is checking for dark mode), Light otherwise
    let autoOption = document.querySelector('option[value="light dark"]'); // reference to option element that has a value attribute of 'light dark'
    autoOption.textContent = "Automatic (" + colorText + ")";
});

// creating the color mode switcher
document.body.insertAdjacentHTML(
    'afterbegin', // insert this dropdown input at the very beginning of body
    `
    <label class="color-scheme">
        Theme:
        <select>
            <option value="light dark">Automatic (${colorText})</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>
    `, // to customize label (doesn't update until refresh): ${matchMedia("(prefers-color-scheme: dark)").matches?"Dark":"Light"}
);

// color mode switcher functionality
let select = document.querySelector("label.color-scheme select"); // this grabs the reference to the select element
select.addEventListener('input', function (event) { // creating an event that looks out for changing the dropdown menu
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
});

if(localStorage.colorScheme) {// on page load, set the color-scheme using localStorage.colorScheme (if it exists)
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme; // make sure the dropdown is on the right selection
}



// Contact Form Functionality
let form = document.querySelector("form"); // a reference to the first form element (only one exists on this site on the contact page)
form?.addEventListener('submit', function (event) {
    event.preventDefault(); // prevents the default html hard coded form response from occuring
    let data = new FormData(form); // create new FormData object using the original mailForm data
    
    let mailURL = form.action + "?" // the action attribute from our form, which would be mailto:iding@ucsd.edu
    for(let [name, value] of data) { // iterate over all the submitted fields in the FormData object
        console.log(name, encodeURIComponent(value));
        mailURL = mailURL + name + "=" + encodeURIComponent(value) + "&";
    }
    location.href = mailURL; // changes the current url, which would be our mailto url
});


