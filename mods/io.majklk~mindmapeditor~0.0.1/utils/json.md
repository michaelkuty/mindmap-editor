[jsonGen](http://www.json-generator.com/)

    [
        '{{repeat(50, 7)}}',
        {
            id: '{{guid}}',
            name: '{{firstName}} {{surname}}',
            children: [
                '{{repeat(10)}}',
                {
                    id: '{{guid}}',
                    name: '{{firstName}} {{surname}}',
                    children: [
                        '{{repeat(10)}}',
                        {
                            id: '{{guid}}',
                            name: '{{firstName}} {{surname}}',
                            children: [
                                '{{repeat(10)}}',
                                {
                                    id: '{{guid}}',
                                    name: '{{firstName}} {{surname}}',
                                    children: [
                                        '{{repeat(4)}}',
                                        {
                                            id: '{{guid}}',
                                            name: '{{firstName}} {{surname}}'
                                        }
                                   ]
                                }
                           ]
                        }
                   ]
                }
            ]
        }
    ]