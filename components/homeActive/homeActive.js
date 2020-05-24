Component({
    properties: {
        // 这里定义了innerText属性，属性值可以在组件使用时指定
        activeUserList: {
            type: Array,
            value: [],
        },
        loading: {
            type: Boolean,
            value: false,
        }
    },
    data: {
        image: 'https://ocrjl5j3c.qnssl.com/8F7DCTIUc9x1509616225.jpg?imageView2/1/w/150/h/150'
    },
    methods: {}
})
