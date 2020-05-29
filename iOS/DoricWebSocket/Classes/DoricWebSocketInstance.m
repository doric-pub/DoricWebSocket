/*
 * Copyright [2019] [Doric.Pub]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
//
// Created by jingpeng.wang on 2020/5/27.
//

#import <DoricCore/DoricUtil.h>
#import <SocketRocket/SRWebSocket.h>

#import "DoricWebSocketInstance.h"

@interface DoricWebSocketInstance() <SRWebSocketDelegate>
@property(nonatomic, strong) SRWebSocket *srWebSocket;
@end

@implementation DoricWebSocketInstance

- (void)open:(NSString *)url {
    if (!_srWebSocket) {
        NSURLRequest *request = [NSURLRequest requestWithURL:[NSURL URLWithString:url] cachePolicy:NSURLRequestReloadIgnoringLocalAndRemoteCacheData timeoutInterval:10];
        _srWebSocket = [[SRWebSocket alloc] initWithURLRequest:request];
        _srWebSocket.delegate = self;
    }
    [_srWebSocket open];
}

- (void)close {
    [_srWebSocket closeWithCode:1006 reason:@"user triggered close"];
}

#pragma mark - SRWebSocketDelegate

- (void)webSocketDidOpen:(SRWebSocket *)webSocket {
    DoricLog(@"webSocketDidOpen");
    [self.onopenPromise resolve:nil];
}

- (void)webSocket:(SRWebSocket *)webSocket didReceivePong:(NSData *)pongPayload {
    DoricLog(@"didReceivePong");
}

- (void)webSocket:(SRWebSocket *)webSocket didReceiveMessage:(id)message {
    DoricLog(@"didReceiveMessage");
    [self.onmessagePromise resolve:nil];
}

- (void)webSocket:(SRWebSocket *)webSocket didFailWithError:(NSError *)error {
    DoricLog(@"didFailWithError");
    [self.onerrorPromise resolve:nil];
}

- (void)webSocket:(SRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean {
    DoricLog(@"didCloseWithCode");
    [self.onclosePromise resolve:nil];
}
@end
