(function () {
    var Message;
    Message = function (arg) {
        this.text = arg.text, this.message_side = arg.message_side, this.author = arg.author;
        this.draw = function (_this) {
            return function () {
                var $message;
                $message = $($('.message_template').clone().html());
                $message.find('.author').html(_this.author);
                $message.addClass(_this.message_side).find('.text').html(_this.text);
                $('.messages').append($message);
                return setTimeout(function () {
                    return $message.addClass('appeared');
                }, 0);
            };
        }(this);
        return this;
    };
    $(function () {
        var getMessageText, message_side, sendMessage, author;
        message_side = 'right';
        author = $('.user').attr('id');
        getMessageText = function () {
            var $message_input;
            $message_input = $('.message_input');
            return $message_input.val();
        };
        sendMessage = function (text) {
            var $messages, message;
            if (text.trim() === '') {
                return;
            }
            $('.message_input').val('');
            $messages = $('.messages');
            message_side = 'left';
            message = new Message({
                text: text,
                message_side: message_side,
                author: author
            });
            message.draw();

            socket.emit('sentMsg', { content: text, dest: $('.dest').attr('id'), user: $('.user').attr('id'), room: $('.room').attr('value'), chatDatas: $('.chatDatas').attr('value') });
            
            return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
        };
        $('.send_message').click(function (e) {
            return sendMessage(getMessageText());
        });
        $('.message_input').keyup(function (e) {
            if (e.which === 13) {
                return sendMessage(getMessageText());
            }
        });


        socket.on('newNotif', function(data) {
            if (data.type == 'msg') {
                
                if ($('.user').attr('id') != data.author) {
                    var $messages, message, text, author;
                    text = data.content;
                    if (text.trim() === '') {
                        return;
                    }
                    $('.message_input').val('');
                    $messages = $('.messages');
                    message_side = 'right';
                    message = new Message({
                        text: text,
                        message_side: message_side,
                        author: data.author
                    });
                    message.draw();

                    socket.emit('readNotifs', {read: data.author, delChat: 'y', user: $('.user').attr('id'), id: socket.id});
                    
                    return $messages.animate({ scrollTop: $messages.prop('scrollHeight') }, 300);
                }
            }
            if ($('.user').attr('id') != data.author) {
                var counter = parseInt($('.badge').html());
                if (isNaN(counter)) {
                    counter = 0;
                }
                var li = $(document.createElement('li'));
                var divider = $(document.createElement('li'));
                divider.addClass('divider');
                li.attr('href', data.href);
                li.html(data.newNotif);
                $('#notifsList').prepend(li);
                $('#notifsList').prepend(divider);
                counter = counter + 1;
                $('.badge').html(counter);
              }
        });
    });


}.call(this));
