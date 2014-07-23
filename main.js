// each choice is like {name: "Nguyen van A", group: "whatever"}
var choices = [];

// Convenient loggin helper
var logEl = document.getElementById('logs');
var log = function(content) {
    logEl.innerHTML += content.toString() + '\n';
    logEl.scrollTop = logEl.scrollHeight;
};

var readWorkbook = function(workbook) {
    choices = [];
    var sheet_name_list = workbook.SheetNames;
    var worksheet = workbook.Sheets.Sheet1;
    for (var z in worksheet) {
        switch (z[0]) {
            case '!':
                continue;
            case 'A':  // name
                choices.push({
                    name: worksheet[z].v.toString(),
                    picked: false,
                });
                break;
            case 'B':  // group
                choices[choices.length - 1].group = worksheet[z].v.toString();
                break;
        }
    }
    log('Vừa cập nhật ' + choices.length + ' tên.');
    updateGroupChoices();
};

// Handle when user submits an excel file
var handleFileInput = function(e) {
    var f = this.files[0];
    var reader = new FileReader();
    var name = f.name;
    reader.onload = function(e) {
        var data = e.target.result;

        /* if binary string, read with type 'binary' */
        var wb = XLSX.read(data, {type: 'binary'});

        /* DO SOMETHING WITH workbook HERE */
        readWorkbook(wb);
    };
    reader.readAsBinaryString(f);
};
var inputEl = document.getElementById('fileInput');
inputEl.addEventListener('change', handleFileInput, false);

// List available groups as radio buttons
var groupsEl = document.getElementById('groups');
var updateGroupChoices = function() {

    // Remove all child nodes a.k.a. choices
    // This approach is much faster than setting innerHTML = ''
    while (groupsEl.firstChild) {
        groupsEl.removeChild(groupsEl.firstChild);
    }

    // Get a list of unique group choices
    var groupChoices = choices.map(function(item) {
        return item.group;
    });
    var uniqueGroupChoices = groupChoices.filter(function(el, pos) {
        return groupChoices.indexOf(el) == pos;
    });

    // Turn them into actual radio buttons
    uniqueGroupChoices.map(function(item) {
        var listItem = document.createElement('li');

        var radioInput = document.createElement('input');
        radioInput.setAttribute('type', 'radio');
        radioInput.setAttribute('name', 'group');
        radioInput.setAttribute('id', item);

        var label = document.createElement('label');
        label.setAttribute('for', item);
        label.innerHTML = item;

        listItem.appendChild(radioInput);
        listItem.appendChild(label);
        groupsEl.appendChild(listItem);
    });

    // "Select all" choice
    var listItem = document.createElement('li');
    listItem.innerHTML = '<input type="radio" name="group" id="all"' +
        ' checked="checked"><label for="all">Tất cả</label>';
    groupsEl.appendChild(listItem);
};

// Handle when user clicks "Pick Random Name" button
var pickRandom = function(e) {
    var choicesMatchingGroup;
    var unpickedChoices;
    var groupChoice = 'all';
    var radios = document.getElementsByName('group');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            groupChoice = radios[i].id;
            break;
        }
    }

    if (groupChoice !== 'all') {
        choicesMatchingGroup = choices.filter(function(item) {
            return item.group === groupChoice;
        });
    } else {
        choicesMatchingGroup = choices;
    }

    unpickedChoices = choicesMatchingGroup.filter(function(item) {
        return item.picked === false;
    });

    var index = Math.floor(Math.random()*unpickedChoices.length);
    var item = unpickedChoices[index];
    item.picked = true;
    log('=> ' + item.name + ' - ' + item.group);

    if (unpickedChoices.length === 1) {
        log('Hết dữ liệu. Lặp lại...');
        for (var i = 0; i < choicesMatchingGroup.length; i++) {
            choicesMatchingGroup[i].picked = false;
        }
    }
};
document.getElementById('pick-btn').onclick = pickRandom;
