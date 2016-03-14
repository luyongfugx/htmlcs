/**
 * @file test for nest-rule spec realization
 * @author nighca<nighca@live.cn>
 */

var emmet = require('emmet');
var rules = require('../../../lib/spec/nest-rule');
var parse = require('../../../lib/parse');

var forEach = function (obj, handler) {
    for (var tag in obj) {
        if (obj.hasOwnProperty(tag)) {
            handler(obj[tag], tag);
        }
    }
};

var doTest = function (tagCases, tag) {
    var rule = rules[tag];

    var getElement = function (domExpression) {
        var htmlCode = emmet.expandAbbreviation(domExpression, {html: 'xhtml'});
        var document = parse(htmlCode);
        return document.querySelector('#target') || document.getElementsByTagName(tag)[0];
    };

    describe('nest rule for ' + tag, function () {
        it('should exist', function () {
            expect(rule).toBeTruthy();
        });
    });

    describe('categories of ' + tag, function () {
        tagCases.categories.forEach(function (situation) {
            it('should be ' + situation.desc, function () {
                situation.cases.forEach(function (testcase) {
                    var dom = testcase[0];
                    var expected = testcase[1];
                    var element = getElement(dom);
                    var categories = rule.getCategories(element);

                    describe('categories of ' + tag + ' in ' + dom, function () {
                        it('should be ' + expected, function () {
                            expect(categories).toEqual(expected);
                        });
                    });
                });
            });
        });
    });

    describe('contexts of ' + tag, function () {
        tagCases.contexts.forEach(function (situation) {
            it('should be ' + situation.desc, function () {
                situation.cases.forEach(function (testcase) {
                    var dom = testcase[0];
                    var expected = testcase[1];
                    var element = getElement(dom);
                    var result = rule.validContext(element, []);

                    describe('for contexts of ' + tag + ' in ' + dom, function () {
                        it('there should be ' + expected + ' problem(s)', function () {
                            expect(result.length).toEqual(expected);
                        });
                    });
                });
            });
        });
    });

    describe('content of ' + tag, function () {
        tagCases.content.forEach(function (situation) {
            it('should be ' + situation.desc, function () {
                situation.cases.forEach(function (testcase) {
                    var dom = testcase[0];
                    var expected = testcase[1];
                    var element = getElement(dom);
                    var result = rule.validContent(element, []);

                    describe('for content of ' + tag + ' in ' + dom, function () {
                        it('there should be ' + expected + ' problem(s)', function () {
                            expect(result.length).toEqual(expected);
                        });
                    });
                });
            });
        });
    });
};

// create cases for 'flow content'
var createFlowContentCases = function (tag) {
    return [
        [tag + '#target>a+abbr+address+article+aside+audio+b+bdi+bdo+blockquote+br+button+canvas+cite+code+data+datalist+del+dfn+div+dl+em+embed+fieldset+figure+footer+form+h1+h2+h3+h4+h5+h6+header+hr+i+iframe+img+input+ins+kbd+keygen+label+main+map+mark+math+meter+nav+noscript+object+ol+output+p+pre+progress+q+ruby+s+samp+script+section+select+small+span+strong+sub+sup+svg+table+template+textarea+time+u+ul+var+video+wbr', 0],
        [tag + '>{hello!}', 0],
        [tag + '>base', 1]
    ];
};

// create cases for 'phrasing content'
var createPhrasingContentCases = function (tag) {
    return [
        [tag + '#target>a+abbr+audio+b+bdi+bdo+br+button+canvas+cite+code+data+datalist+del+dfn+em+embed+i+iframe+img+input+ins+kbd+keygen+label+map+mark+math+meter+noscript+object+output+progress+q+ruby+s+samp+script+select+small+span+strong+sub+sup+svg+template+textarea+time+u+var+video+wbr', 0],
        [tag + '{hello!}', 0],
        [tag + '>base', 1],
        [tag + '>section', 1]
    ];
};

// create cases for h1, h2, h3, h4, h5 & h6
var createHeadingCases = function (tag) {
    return {
        categories: [
            {
                desc: 'flow content, heading content, palpable content',
                cases: [
                    [tag, ['flow content', 'heading content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>' + tag, 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases(tag)
            }
        ]
    };
};

// create cases for ol & ul
var createListCases = function (tag) {
    return {
        categories: [
            {
                desc: 'flow content',
                cases: [
                    [tag, ['flow content']]
                ]
            },
            {
                desc: 'if the element\'s children include at least one li element: palpable content',
                cases: [
                    [tag + '>li', ['flow content', 'palpable content']],
                    [tag + '>li*2', ['flow content', 'palpable content']],
                    [tag + '>li+p', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>' + tag, 0]
                ]
            }
        ],
        content: [
            {
                desc: 'zero or more li and script-supporting elements',
                cases: [
                    [tag, 0],
                    [tag + '>li', 0],
                    [tag + '>script+template', 0],
                    [tag + '>li+script+template', 0],
                    [tag + '>li+script+li+template', 0],
                    [tag + '>p', 1],
                    [tag + '>p+div', 2],
                    [tag + '>li+script+li+p+template', 1],
                    [tag + '>li+script+li+p+template+div', 2]
                ]
            }
        ]
    };
};

var casesByTag = {
    html: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['html>head+body', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as the root element of a document',
                cases: [
                    ['html>head+body', 0],
                    ['div>html>head+body', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'a head element followed by a body element',
                cases: [
                    ['html>head+body', 0],
                    ['html', 1],
                    ['html>head', 1],
                    ['html>body', 1],
                    ['html>head+div+body', 1],
                    ['html>div+head+body', 1],
                    ['html>head+body+div', 1]
                ]
            }
        ]
    },
    head: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['head', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as the first element in an html element',
                cases: [
                    ['html>head+body', 0],
                    ['html>div+head+body', 1],
                    ['div>head+body', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'elements of metadata content, of which no more than one is a title element and no more than one is a base element',
                cases: [
                    ['head', 0],
                    ['head>div', 1],
                    ['head>meta+title+base', 0],
                    ['head>meta+title*2', 1],
                    ['head>meta+base*2', 1]
                ]
            }
        ]
    },
    title: {
        categories: [
            {
                desc: 'metadata content',
                cases: [
                    ['title', ['metadata content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'in a head element containing no other title elements',
                cases: [
                    ['head>title', 0],
                    ['head>title+meta', 0],
                    ['head>title*2+meta', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'text that is not inter-element whitespace',
                cases: [
                    ['title{hello!}', 0],
                    ['title>p{hello!}', 1],
                    ['title{\u0020\u0009\u000a\u000c\u000d}', 1],
                ]
            }
        ]
    },
    base: {
        categories: [
            {
                desc: 'metadata content',
                cases: [
                    ['base', ['metadata content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'in a head element containing no other base elements',
                cases: [
                    ['head>base', 0],
                    ['head>base+meta', 0],
                    ['head>base*2+meta', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['base', 0]
                ]
            }
        ]
    },
    link: {
        categories: [
            {
                desc: 'metadata content',
                cases: [
                    ['link', ['metadata content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where metadata content is expected',
                cases: [
                    ['head>link', 0]
                ]
            },
            {
                desc: 'in a noscript element that is a child of a head element',
                cases: [
                    ['head>noscript>link', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['link', 0]
                ]
            }
        ]
    },
    meta: {
        categories: [
            {
                desc: 'metadata content',
                cases: [
                    ['meta', ['metadata content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'if the charset attribute is present, or if the element\'s http-equiv attribute is in the encoding declaration state: in a head element',
                cases: [
                    ['head>meta[charset="utf-8"]', 0],
                    ['head>meta[http-equiv="content-type"]', 0],
                    ['p>meta[charset="utf-8"]', 1],
                    ['p>meta[http-equiv="content-type"]', 1]
                ]
            },
            {
                desc: 'if the http-equiv attribute is present but not in the encoding declaration state: in a head element or in a noscript element that is a child of a head element',
                cases: [
                    ['head>meta[http-equiv="expires"]', 0],
                    ['head>noscript>meta[http-equiv="expires"]', 0],
                    ['p>meta[http-equiv="expires"]', 1],
                    ['head>p>meta[http-equiv="expires"]', 1]
                ]
            },
            {
                desc: 'if the name attribute is present: where metadata content is expected',
                cases: [
                    ['head>meta[name="author"]', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['meta', 0]
                ]
            }
        ]
    },
    style: {
        categories: [
            {
                desc: 'metadata content',
                cases: [
                    ['style', ['metadata content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where metadata content is expected',
                cases: [
                    ['head>style', 0]
                ]
            },
            {
                desc: 'in a noscript element that is a child of a head element',
                cases: [
                    ['head>noscript>style', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['style', 0]
                ]
            }
        ]
    },
    body: {
        categories: [
            {
                desc: 'sectioning root',
                cases: [
                    ['body', ['sectioning root']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as the second element in an html element',
                cases: [
                    ['html>head+body', 0],
                    ['html>body', 1],
                    ['div>head+body', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('body')
            }
        ]
    },
    article: {
        categories: [
            {
                desc: 'flow content but with no main element descendants, sectioning content, palpable content',
                cases: [
                    ['article', ['flow content', 'sectioning content', 'palpable content']],
                    ['article>main', ['sectioning content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>article', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('article')
            }
        ]
    },
    section: {
        categories: [
            {
                desc: 'flow content, sectioning content, palpable content',
                cases: [
                    ['section', ['flow content', 'sectioning content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>section', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('section')
            }
        ]
    },
    nav: {
        categories: [
            {
                desc: 'flow content, sectioning content, palpable content',
                cases: [
                    ['nav', ['flow content', 'sectioning content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>nav', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content, but with no main element descendants',
                cases: createFlowContentCases('nav')
                // but with no main element descendants
                // -> context of [ main ]
            }
        ]
    },
    aside: {
        categories: [
            {
                desc: 'flow content, sectioning content, palpable content',
                cases: [
                    ['aside', ['flow content', 'sectioning content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>aside', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content, but with no main element descendants',
                cases: createFlowContentCases('aside')
                // but with no main element descendants
                // -> context of [ main ]
            }
        ]
    },
    h1: createHeadingCases('h1'),
    h2: createHeadingCases('h2'),
    h3: createHeadingCases('h3'),
    h4: createHeadingCases('h4'),
    h5: createHeadingCases('h5'),
    h6: createHeadingCases('h6'),
    header: {
        categories: [
            {
                desc: 'flow content, palpable content',
                cases: [
                    ['header', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>header', 0]
                ]
            },
            // with no header or footer element ancestors
            // see content requirement of [ header / footer ]
            {
                desc: 'with no header or footer element ancestors',
                cases: [
                    ['header>header#target', 1],
                    ['footer>header', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content, but with no header, footer, or main element descendants',
                cases: createFlowContentCases('header')
                // but with no header, footer, or main element descendants
                // -> context of [ header, footer, or main ]
            }
        ]
    },
    footer: {
        categories: [
            {
                desc: 'flow content, palpable content',
                cases: [
                    ['footer', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>footer', 0]
                ]
            },
            // with no header or footer element ancestors
            // see content requirement of [ header / footer ]
            {
                desc: 'with no header or footer element ancestors',
                cases: [
                    ['header>footer', 1],
                    ['footer>footer#target', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content, but with no header, footer, or main element descendants',
                cases: createFlowContentCases('footer')
                // but with no header, footer, or main element descendants
                // -> context of [ header, footer, or main ]
            }
        ]
    },
    address: {
        categories: [
            {
                desc: 'flow content, palpable content',
                cases: [
                    ['address', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>address', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content, but with no heading content descendants, no sectioning content descendants, and no header, footer, or address element descendants',
                cases: [
                    ['address#target>a+abbr+audio+b+bdi+bdo+blockquote+br+button+canvas+cite+code+data+datalist+del+dfn+div+dl+em+embed+fieldset+figure+form+hr+i+iframe+img+input+ins+kbd+keygen+label+main+map+mark+math+meter+noscript+object+ol+output+p+pre+progress+q+ruby+s+samp+script+select+small+span+strong+sub+sup+svg+table+template+textarea+time+u+ul+var+video+wbr', 0],
                    ['address>{hello!}', 0],
                    ['address>base', 1],
                    ['address>h1+h2+h3+h4+h5+h6', 6],
                    ['address>div>h1+h2+h3+h4+h5+h6', 6],
                    ['address>article+aside+nav+section', 4],
                    ['address>div>article+aside+nav+section', 4],
                    ['address#target>header+footer+address', 3],
                    ['address#target>div>header+footer+address', 3]
                ]
            }
        ]
    },
    p: {
        categories: [
            {
                desc: 'flow content, palpable content',
                cases: [
                    ['p', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>p', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('p')
            }
        ]
    },
    hr: {
        categories: [
            {
                desc: 'flow content',
                cases: [
                    ['hr', ['flow content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>hr', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['hr', 0]
                ]
            }
        ]
    },
    pre: {
        categories: [
            {
                desc: 'flow content, palpable content',
                cases: [
                    ['pre', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>pre', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('pre')
            }
        ]
    },
    blockquote: {
        categories: [
            {
                desc: 'flow content, sectioning root, palpable content',
                cases: [
                    ['blockquote', ['flow content', 'sectioning root', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>blockquote', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('blockquote')
            }
        ]
    },
    ol: createListCases('ol'),
    ul: createListCases('ul'),
    li: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['li', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'inside ol elements, inside ul elements',
                cases: [
                    ['ol>li', 0],
                    ['ul>li', 0],
                    ['div>li', 1],
                    ['p>li', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('li')
            }
        ]
    },
    dl: {
        categories: [
            {
                desc: 'flow content',
                cases: [
                    ['dl', ['flow content']]
                ]
            },
            {
                desc: 'if the element\'s children include at least one name-value group: palpable content',
                cases: [
                    ['dl>dt+dd', ['flow content', 'palpable content']],
                    ['dl>dt+dd+dt+dd', ['flow content', 'palpable content']],
                    ['dl>dt+dd>span', ['flow content', 'palpable content']],
                    ['dl>dt+p+dd>span', ['flow content', 'palpable content']],
                    ['dl>dt', ['flow content']],
                    ['dl>dd', ['flow content']],
                    ['dl>dd+dt', ['flow content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>dl', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'zero or more groups each consisting of one or more dt elements followed by one or more dd elements, optionally intermixed with script-supporting elements',
                cases: [
                    ['dl', 0],
                    ['dl>dt+dd', 0],
                    ['dl>dt*2+dd', 0],
                    ['dl>dt*2+dd*2', 0],
                    ['dl>dt+dd+dt+dd', 0],
                    ['dl>script+template', 0],
                    ['dl>dt+dd+script+template', 0],
                    ['dl>dt+script+dd+template', 0],
                    ['dl>p', 1],
                    ['dl>p+div', 2],
                    ['dl>dt+script+dd+p+template', 1],
                    ['dl>dt+script+dd+p+template+div', 2],
                    ['dl>dd+dt', 1],
                    ['dl>dt+dd+dt', 1],
                    ['dl>dt+dd+dt+script+template', 1]
                ]
            }
        ]
    },
    dt: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['dt', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'before dd or dt elements inside dl elements',
                cases: [
                    // before dd or dt elements
                    // -> content of [ dl ]
                    // inside dl elements
                    ['dl>dt', 0],
                    ['dl>dt#target+dt', 0],
                    ['p>dt#target+dt', 1],
                    ['div>dt#target+dt', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content, but with no header, footer, sectioning content, or heading content descendants',
                cases: [
                    ['dt>a+abbr+address+audio+b+bdi+bdo+blockquote+br+button+canvas+cite+code+data+datalist+del+dfn+div+dl+em+embed+fieldset+figure+form+hr+i+iframe+img+input+ins+kbd+keygen+label+main+map+mark+math+meter+noscript+object+ol+output+p+pre+progress+q+ruby+s+samp+script+select+small+span+strong+sub+sup+svg+table+template+textarea+time+u+ul+var+video+wbr', 0],
                    ['dt>{hello!}', 0],
                    ['dt>base', 1],
                    ['dt>header+footer', 2],
                    ['dt>article+aside+nav+section', 4],
                    ['dt>h1+h2+h3+h4+h5+h6', 6]
                ]
            }
        ]
    },
    dd: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['dd', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'after dt or dd elements inside dl elements',
                cases: [
                    // after dt or dd elements
                    // -> content of [ dl ]
                    // inside dl elements
                    ['dl>dd', 0],
                    ['dl>dd#target+dd', 0],
                    ['p>dd#target+dd', 1],
                    ['div>dd#target+dd', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('dd')
            }
        ]
    },
    figure: {
        categories: [
            {
                desc: 'flow content, sectioning root, palpable content',
                cases: [
                    ['figure', ['flow content', 'sectioning root', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>figure', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'either: one figcaption element followed by flow content, or: flow content followed by one figcaption element, or: flow content',
                // content: raw - either: one figcaption element followed by flow content
                // content: raw - or: flow content followed by one figcaption element
                // -> context of [ figcaption ]

                // content: raw - or: flow content
                cases: createFlowContentCases('figure')
            }
        ]
    },
    figcaption: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['figcaption', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as the first or last child of a figure element',
                cases: [
                    ['figure>figcaption', 0],
                    ['figure>p+figcaption', 0],
                    ['figure>p+figcaption+p', 1],
                    ['div>figcaption', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('figcaption')
            }
        ]
    },
    div: {
        categories: [
            {
                desc: 'flow content, palpable content',
                cases: [
                    ['div', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>div', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('div')
            }
        ]
    },
    main: {
        categories: [
            {
                desc: 'flow content, palpable content',
                cases: [
                    ['main', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected, but with no article, aside, footer, header or nav element ancestors',
                cases: [
                    ['body>main', 0],
                    ['article>main', 1],
                    ['article>div>main', 1],
                    ['aside>div>main', 1],
                    ['footer>div>main', 1],
                    ['header>div>main', 1],
                    ['nav>div>main', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content',
                cases: createFlowContentCases('main')
            }
        ]
    },
    a: {
        categories: [
            {
                desc: 'flow content, phrasing content, interactive content, palpable content',
                cases: [
                    ['a', ['flow content', 'phrasing content', 'interactive content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>a', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'transparent, but there must be no interactive content descendant',
                cases: [
                    // transparent
                    ['p>a{hello!}', 0],
                    ['p>a>span{hello!}', 0],
                    ['p>a>div', 1],
                    // but there must be no interactive content descendant
                    ['a>button', 1],
                    ['a>p>button', 1]
                ]
            }
        ]
    },
    em: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['em', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>em', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('em')
            }
        ]
    },
    strong: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['strong', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>strong', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('strong')
            }
        ]
    },
    small: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['small', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>small', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('small')
            }
        ]
    },
    s: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['s', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>s', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('s')
            }
        ]
    },
    cite: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['cite', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>cite', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('cite')
            }
        ]
    },
    q: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['q', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>q', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('q')
            }
        ]
    },
    dfn: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['dfn', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>dfn', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content, but there must be no dfn element descendants',
                cases: [
                    ['dfn>a+abbr+audio+b+bdi+bdo+br+button+canvas+cite+code+data+datalist+del+em+embed+i+iframe+img+input+ins+kbd+keygen+label+map+mark+math+meter+noscript+object+output+progress+q+ruby+s+samp+script+select+small+span+strong+sub+sup+svg+template+textarea+time+u+var+video+wbr', 0],
                    ['dfn{hello!}', 0],
                    ['dfn>base', 1],
                    ['dfn>section', 1],
                    ['dfn#target>dfn', 1],
                    ['dfn#target>span>dfn', 1]
                ]
            }
        ]
    },
    abbr: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['abbr', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>abbr', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('abbr')
            }
        ]
    },
    data: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['data', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>data', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('data')
            }
        ]
    },
    time: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['time', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>time', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('time')
            }
        ]
    },
    code: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['code', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>code', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('code')
            }
        ]
    },
    var: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['var', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>var', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('var')
            }
        ]
    },
    samp: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['samp', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>samp', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('samp')
            }
        ]
    },
    kbd: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['kbd', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>kbd', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('kbd')
            }
        ]
    },
    sub: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['sub', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>sub', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('sub')
            }
        ]
    },
    sup: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['sup', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>sup', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('sup')
            }
        ]
    },
    i: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['i', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>i', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('i')
            }
        ]
    },
    b: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['b', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>b', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('b')
            }
        ]
    },
    u: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['u', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>u', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('u')
            }
        ]
    },
    mark: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['mark', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>mark', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('mark')
            }
        ]
    },
    ruby: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['ruby', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>ruby', 0]
                ]
            }
        ],
        content: [
            // TODO
        ]
    },
    rb: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['rb', []]
                ]
            }
        ],
        contexts: [
            // TODO
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('rb')
            }
        ]
    },
    rt: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['rt', []]
                ]
            }
        ],
        contexts: [
            // TODO
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('rt')
            }
        ]
    },
    rtc: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['rtc', []]
                ]
            }
        ],
        contexts: [
            // TODO
        ],
        content: [
            // TODO
        ]
    },
    rp: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['rp', []]
                ]
            }
        ],
        contexts: [
            // TODO
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('rp')
            }
        ]
    },
    bdi: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['bdi', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>bdi', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('bdi')
            }
        ]
    },
    bdo: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['bdo', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>bdo', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('bdo')
            }
        ]
    },
    span: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['span', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>span#target', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'phrasing content',
                cases: createPhrasingContentCases('span')
            }
        ]
    },
    br: {
        categories: [
            {
                desc: 'flow content, phrasing content',
                cases: [
                    ['br', ['flow content', 'phrasing content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>br', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['br', 0]
                ]
            }
        ]
    },
    wbr: {
        categories: [
            {
                desc: 'flow content, phrasing content',
                cases: [
                    ['wbr', ['flow content', 'phrasing content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>wbr', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['wbr', 0]
                ]
            }
        ]
    },
    ins: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['ins', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>ins', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'transparent',
                cases: [
                    ['p>ins{hello!}', 0],
                    ['p>ins>span{hello!}', 0],
                    ['p>ins>div', 1]
                ]
            }
        ]
    },
    del: {
        categories: [
            {
                desc: 'flow content, phrasing content',
                cases: [
                    ['del', ['flow content', 'phrasing content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>del', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'transparent',
                cases: [
                    ['p>del{hello!}', 0],
                    ['p>del>span{hello!}', 0],
                    ['p>del>div', 1]
                ]
            }
        ]
    },
    img: {
        categories: [
            {
                desc: 'flow content, phrasing content, embedded content, form-associated element, palpable content',
                cases: [
                    ['img', ['flow content', 'phrasing content', 'embedded content', 'form-associated element', 'palpable content']]
                ]
            },
            {
                desc: 'if the element has a usemap attribute: interactive content',
                cases: [
                    ['img[usemap="#test"]', ['flow content', 'phrasing content', 'embedded content', 'form-associated element', 'palpable content', 'interactive content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where embedded content is expected',
                cases: []
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['img', 0]
                ]
            }
        ]
    },
    iframe: {
        categories: [
            {
                desc: 'flow content, phrasing content, embedded content, interactive content, palpable content',
                cases: [
                    ['iframe', ['flow content', 'phrasing content', 'embedded content', 'interactive content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where embedded content is expected',
                cases: []
            }
        ],
        content: [
            {
                desc: 'text that conforms to the requirements given in the prose',
                cases: [
                    // TODO
                ]
            }
        ]
    },
    embed: {
        categories: [
            {
                desc: 'flow content, phrasing content, embedded content, interactive content, palpable content',
                cases: [
                    ['embed', ['flow content', 'phrasing content', 'embedded content', 'interactive content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where embedded content is expected',
                cases: []
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['embed', 0]
                ]
            }
        ]
    },
    object: {
        categories: [
            {
                desc: 'flow content, phrasing content, embedded content, listed, submittable, and reassociateable form-associated element, palpable content',
                cases: [
                    ['object', ['flow content', 'phrasing content', 'embedded content', 'listed, submittable, and reassociateable form-associated element', 'palpable content']]
                ]
            },
            {
                desc: 'if the element has a usemap attribute: interactive content',
                cases: [
                    ['object[usemap="#test"]', ['flow content', 'phrasing content', 'embedded content', 'listed, submittable, and reassociateable form-associated element', 'palpable content', 'interactive content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where embedded content is expected',
                cases: []
            }
        ],
        content: [
            {
                desc: 'zero or more param elements, then, transparent',
                cases: [
                    ['p>object{hello!}', 0],
                    ['p>object>span{hello!}', 0],
                    ['p>object>param+span{hello!}', 0],
                    ['p>object>span{hello!}+param', 0],
                    ['p>object>div', 1]
                ]
            }
        ]
    },
    param: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['param', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as a child of an object element, before any flow content',
                cases: [
                    ['object>param', 0],
                    ['object>param+div', 0],
                    ['object>div+param', 1],
                    ['object>div+param+p', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['param', 0]
                ]
            }
        ]
    },
    video: {
        categories: [
            {
                desc: 'flow content, phrasing content, embedded content, palpable content',
                cases: [
                    ['video', ['flow content', 'phrasing content', 'embedded content', 'palpable content']]
                ]
            },
            {
                desc: 'if the element has a controls attribute: interactive content',
                cases: [
                    ['video[controls]', ['flow content', 'phrasing content', 'embedded content', 'palpable content', 'interactive content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where embedded content is expected',
                cases: []
            }
        ],
        content: [
            {
                desc: 'if the element has a src attribute: zero or more track elements, then transparent, but with no media element descendants',
                cases: [
                    ['p>video[src="./test.mp4"]', 0],
                    ['p>video[src="./test.mp4"]>source', 1],
                    ['p>video[src="./test.mp4"]>track', 0],
                    ['p>video[src="./test.mp4"]>track*2', 0],
                    ['p>video[src="./test.mp4"]{hello!}', 0],
                    ['p>video[src="./test.mp4"]>span{hello!}', 0],
                    ['p>video[src="./test.mp4"]>div', 1],
                    ['p>video[src="./test.mp4"]>track+div', 1],
                    ['p>video#target[src="./test.mp4"]>audio+video', 2],
                    ['p>video#target[src="./test.mp4"]>span>audio+video', 2],
                ]
            },
            {
                desc: 'if the element does not have a src attribute: zero or more source elements, then zero or more track elements, then transparent, but with no media element descendants',
                cases: [
                    ['p>video', 0],
                    ['p>video>source', 0],
                    ['p>video>source*2', 0],
                    ['p>video>track', 0],
                    ['p>video>track*2', 0],
                    ['p>video>source+track', 0],
                    ['p>video{hello!}', 0],
                    ['p>video>span{hello!}', 0],
                    ['p>video>div', 1],
                    ['p>video>source+div', 1],
                    ['p>video>track+div', 1],
                    ['p>video#target>audio+video', 2],
                    ['p>video#target>span>audio+video', 2],
                ]
            }
        ]
    },
    audio: {
        categories: [
            {
                desc: 'flow content, phrasing content, embedded content',
                cases: [
                    ['audio', ['flow content', 'phrasing content', 'embedded content']]
                ]
            },
            {
                desc: 'if the element has a controls attribute: interactive content, if the element has a controls attribute: palpable content',
                cases: [
                    ['audio[controls]', ['flow content', 'phrasing content', 'embedded content', 'interactive content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where embedded content is expected',
                cases: []
            }
        ],
        content: [
            {
                desc: 'if the element has a src attribute: zero or more track elements, then transparent, but with no media element descendants',
                cases: [
                    ['p>audio[src="./test.mp3"]', 0],
                    ['p>audio[src="./test.mp3"]>source', 1],
                    ['p>audio[src="./test.mp3"]>track', 0],
                    ['p>audio[src="./test.mp3"]>track*2', 0],
                    ['p>audio[src="./test.mp3"]{hello!}', 0],
                    ['p>audio[src="./test.mp3"]>span{hello!}', 0],
                    ['p>audio[src="./test.mp3"]>div', 1],
                    ['p>audio[src="./test.mp3"]>track+div', 1],
                    ['p>audio#target[src="./test.mp3"]>audio+video', 2],
                    ['p>audio#target[src="./test.mp3"]>span>audio+video', 2],
                ]
            },
            {
                desc: 'if the element does not have a src attribute: zero or more source elements, then zero or more track elements, then transparent, but with no media element descendants',
                cases: [
                    ['p>audio', 0],
                    ['p>audio>source', 0],
                    ['p>audio>source*2', 0],
                    ['p>audio>track', 0],
                    ['p>audio>track*2', 0],
                    ['p>audio>source+track', 0],
                    ['p>audio{hello!}', 0],
                    ['p>audio>span{hello!}', 0],
                    ['p>audio>div', 1],
                    ['p>audio>source+div', 1],
                    ['p>audio>track+div', 1],
                    ['p>audio#target>audio+video', 2],
                    ['p>audio#target>span>audio+video', 2],
                ]
            }
        ]
    },
    source: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['source', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as a child of a media element, before any flow content or track elements',
                cases: [
                    ['video>source', 0],
                    ['audio>source', 0],
                    ['div>source', 1],
                    ['video>source+div', 0],
                    ['video>source+track+div', 0],
                    ['video>div+source', 1],
                    ['video>track+source', 1],
                    ['video>div+source+p', 1],
                    ['video>track+source+p', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['source', 0]
                ]
            }
        ]
    },
    track: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['track', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as a child of a media element, before any flow content',
                cases: [
                    ['video>track', 0],
                    ['audio>track', 0],
                    ['div>track', 1],
                    ['video>track+div', 0],
                    ['video>div+track', 1],
                    ['video>div+track+p', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['track', 0]
                ]
            }
        ]
    },
    map: {
        categories: [
            {
                desc: 'flow content, phrasing content, palpable content',
                cases: [
                    ['map', ['flow content', 'phrasing content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected',
                cases: [
                    ['span>map', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'transparent',
                cases: [
                    ['p>map{hello!}', 0],
                    ['p>map>span{hello!}', 0],
                    ['p>map>div', 1]
                ]
            }
        ]
    },
    area: {
        categories: [
            {
                desc: 'flow content, phrasing content',
                cases: [
                    ['area', ['flow content', 'phrasing content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where phrasing content is expected, but only if there is a map element ancestor or a template element ancestor',
                cases: [
                    ['map>area', 0],
                    ['template>area', 0],
                    ['map>span>area', 0],
                    ['template>span>area', 0],
                    ['span>area', 1]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['area', 0]
                ]
            }
        ]
    },
    table: {
        categories: [
            {
                desc: 'flow content, palpable content',
                cases: [
                    ['table', ['flow content', 'palpable content']]
                ]
            }
        ],
        contexts: [
            {
                desc: 'where flow content is expected',
                cases: [
                    ['body>table', 0]
                ]
            }
        ],
        content: [
            {
                desc: 'in this order: optionally a caption element, followed by zero or more colgroup elements, followed optionally by a thead element, followed optionally by a tfoot element, followed by either zero or more tbody elements or one or more tr elements, followed optionally by a tfoot element (but there can only be one tfoot element child in total), optionally intermixed with one or more script-supporting elements',
                cases: [
                    // optional children
                    ['table>caption+colgroup+thead+tbody+tfoot', 0],
                    ['table>colgroup+thead+tbody+tfoot', 0],
                    ['table>caption+thead+tbody+tfoot', 0],
                    ['table>caption+colgroup*2+thead+tbody+tfoot', 0],
                    ['table>caption+colgroup+tbody+tfoot', 0],
                    ['table>caption+colgroup+thead+tfoot', 0],
                    ['table>caption+colgroup+thead+tbody', 0],
                    ['table>caption+colgroup+thead+tr+tfoot', 0],
                    ['table>caption+colgroup+thead+tr*2+tfoot', 0],
                    // tbody & tr should not show together
                    ['table>caption+colgroup+thead+tbody+tr+tfoot', 1],
                    // but there can only be one tfoot element child in total
                    ['table>caption+colgroup+thead+tfoot+tbody+tfoot', 1],
                    // optionally intermixed with one or more script-supporting elements
                    ['table>caption+script+colgroup+template+thead+script+tbody+template+tfoot', 0],
                    // no other elements
                    ['table>span+caption+colgroup+thead+tbody+tfoot', 1],
                    ['table>p+caption+colgroup+thead+tbody+tfoot', 1],
                    // in given order
                    ['table>colgroup+caption+thead+tbody+tfoot', 1],
                    ['table>thead+caption+colgroup+tbody+tfoot', 1],
                    ['table>caption+colgroup+tbody+thead+tfoot', 1],
                    ['table>caption+colgroup+tfoot+thead+tbody', 1]
                ]
            }
        ]
    },
    caption: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['caption', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as the first element child of a table element',
                cases: [
                    // as a child of a table element
                    ['table>caption', 0],
                    ['body>caption', 1],
                    ['div>caption', 1],
                    ['span>caption', 1]
                    // the first element child
                    // -> content of [ table ]
                ]
            }
        ],
        content: [
            {
                desc: 'flow content, but with no descendant table elements',
                cases: [
                    // flow content (without table)
                    ['caption>a+abbr+address+article+aside+audio+b+bdi+bdo+blockquote+br+button+canvas+cite+code+data+datalist+del+dfn+div+dl+em+embed+fieldset+figure+footer+form+h1+h2+h3+h4+h5+h6+header+hr+i+iframe+img+input+ins+kbd+keygen+label+main+map+mark+math+meter+nav+noscript+object+ol+output+p+pre+progress+q+ruby+s+samp+script+section+select+small+span+strong+sub+sup+svg+template+textarea+time+u+ul+var+video+wbr', 0],
                    ['caption>{hello!}', 0],
                    ['caption>base', 1],
                    // but with no descendant table elements
                    ['caption>table', 1],
                    ['caption>div>table', 1]
                ]
            }
        ]
    },
    colgroup: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['colgroup', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as a child of a table element, after any caption elements and before any thead, tbody, tfoot, and tr elements',
                cases: [
                    // as a child of a table element
                    ['table>colgroup', 0],
                    ['body>colgroup', 1],
                    ['div>colgroup', 1],
                    ['span>colgroup', 1]
                    // after any caption elements and before any thead, tbody, tfoot, and tr elements
                    // -> content of [ table ]
                ]
            }
        ],
        content: [
            {
                desc: 'if the span attribute is present: empty',
                cases: [
                    ['colgroup[span="2"]', 0],
                    ['colgroup[span="2"]>col', 1],
                    ['colgroup[span="2"]>template', 1],
                    ['colgroup[span="2"]>p', 1],
                    ['colgroup[span="2"]>div', 1],
                    ['colgroup[span="2"]>span', 1]
                ]
            },
            {
                desc: 'if the span attribute is absent: zero or more col and template elements',
                cases: [
                    ['colgroup', 0],
                    ['colgroup>col', 0],
                    ['colgroup>col*2', 0],
                    ['colgroup>template', 0],
                    ['colgroup>template*2', 0],
                    ['colgroup>col+template', 0],
                    ['colgroup>col+p', 1],
                    ['colgroup>col*2+div', 1],
                    ['colgroup>col+span+template', 1]
                ]
            }
        ]
    },
    col: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['col', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as a child of a colgroup element that doesn\'t have a span attribute',
                cases: [
                    // as a child of a colgroup element
                    ['colgroup>col', 0],
                    ['body>col', 1],
                    ['div>col', 1],
                    ['span>col', 1]
                    // as a child of a colgroup element that doesn't have a span attribute
                    // -> content of [ colgroup ]
                ]
            }
        ],
        content: [
            {
                desc: 'empty',
                cases: [
                    ['col', 0]
                ]
            }
        ]
    },
    tbody: {
        categories: [
            {
                desc: 'none',
                cases: [
                    ['tbody', []]
                ]
            }
        ],
        contexts: [
            {
                desc: 'as a child of a table element, after any caption, colgroup, and thead elements, but only if there are no tr elements that are children of the table element',
                cases: [
                    // as a child of a table element
                    ['table>tbody', 0],
                    ['body>tbody', 1],
                    ['div>tbody', 1],
                    ['span>tbody', 1]
                    // after any caption, colgroup, and thead elements, but only if there are no tr elements that are children of the table element
                    // -> content of [ table ]
                ]
            }
        ],
        content: [
            {
                desc: 'zero or more tr and script-supporting elements',
                cases: [
                    ['tbody', 0],
                    ['tbody>tr', 0],
                    ['tbody>script', 0],
                    ['tbody>tr+script+tr', 0],
                    ['tbody>p', 1],
                    ['tbody>tr*2+div', 1],
                    ['tbody>tr+script+span', 1]
                ]
            }
        ]
    }
};

forEach(casesByTag, doTest);
