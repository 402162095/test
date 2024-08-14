window.sendFile = function(targetId, data, name, type) {
	var file = new File([data], name);
	// console.log(file);
	const fileOption = {
		data: file,
		filename: name,
		filetype: "file",
		size: file.size
	};
	let option = {
		// 消息类型。
		type: type,
		file: fileOption,
		// 消息接收方：单聊为对方用户 ID，群聊和聊天室分别为群组 ID 和聊天室 ID。
		to: targetId,
		// 会话类型：单聊、群聊和聊天室分别为 `singleChat`、`groupChat` 和 `chatRoom`。
		chatType: "groupChat",
		filename: name,
		// 文件上传失败。
		onFileUploadError: function() {
			console.log("onFileUploadError");
		},
		// 文件上传进度。
		onFileUploadProgress: function(e) {
			console.log(e);
		},
		// 文件上传成功。
		onFileUploadComplete: function() {
			console.log("onFileUploadComplete");
		},
		ext: {
			file_length: file.size,
			file_name: name,
			"ease_chat_uikit_user_info": {
				avatarURL: userOption.avatarurl,
				nickname: userOption.nickname
			}
		},
	};


	// 创建一条文件消息。
	let msg = WebIM.message.create(option);
	// 调用 `send` 方法发送该文件消息。
	WebIM.conn
		.send(msg)
		.then((res) => {
			// 文件消息成功发送。
			console.log("Success");
			window.sendSuccess(JSON.stringify(res));
		})
		.catch((e) => {
			// 文件消息发送失败。
			console.log(e);
			console.log("----Fail-----");
		});
};
let userOption = {};
window.updateUserInfo = function(nickname, avatarurl) {
	userOption = {
		nickname: nickname,
		avatarurl: avatarurl
	};
	WebIM.conn.updateUserInfo(option).then((res) => {
		console.log("updateUserInfo.....");
		console.log(res);
	});
};


var ms = [];
window.login = function(accessToken, userid) {
	WebIM.conn
		.open({
			'accessToken': accessToken,
			'user': userid
		})
		.then((res) => {
			console.log(`Login Success`);
			window.loginCallback(true);
		})
		.catch((e) => {
			console.log(`Login failed`);
			if (e.type == 206) {
				window.loginCallback(true);
			} else {
				window.loginCallback(false);
			}

		});

};
window.sendMessage = function(content) {

	var option = JSON.parse(content);
	option["chatType"] = 'groupChat';
	option["ext"] = {
		"ease_chat_uikit_user_info": {
			avatarURL: userOption.avatarurl,
			nickname: userOption.nickname
		}
	}

	let msg = WebIM.message.create(option);
	WebIM.conn.send(msg).then((res) => {
		window.sendSuccess(JSON.stringify(res));
	}).catch(() => {
		console.log('send private text fail');
	});
};
window.loadHistoryMessages = function(targetId) {
	var cursor = -1;
	ms = [];
	getAllHistoryMessage(
		targetId,
		cursor,
		(messages) => {
			window.getHistoryMessages(JSON.stringify(messages));
		}
	);
	// console.log(ms);

};

function getAllHistoryMessage(targetId, cursor, callSuccess) {

	WebIM.conn.getHistoryMessages({
		targetId: targetId,
		chatType: 'groupChat',
		cursor: cursor,
		pageSize: 50,
		success: (m) => {
			ms.push(...m.messages);
			if (m.messages.length < 20) {
				callSuccess(ms);
			} else {
				getAllHistoryMessage(targetId, m.cursor, callSuccess);
			}

		}
	});
};
window.initIM = function(appKey) {
	WebIM.conn = new WebIM.connection({
		//注意这里的 "K" 需大写。
		'appKey': appKey,
	});
	// 添加回调函数。
	WebIM.conn.addEventHandler('connection&message', {
		onConnected: () => {
			console.log("Connected success !");
		},
		onDisconnected: () => {
			console.log("disconnected success !");
		},
		onMessage: (message) => {
			console.log(message);
			window.onMessage(JSON.stringify(message));
		},
		onError: (error) => {
			console.log(error);
			if (error.type == 28) {
				window.reLogin();
			}
			console.log('on error', error)
		}
	});
	console.log(window);
};
window.logout = function() {
	WebIM.conn.close();
}