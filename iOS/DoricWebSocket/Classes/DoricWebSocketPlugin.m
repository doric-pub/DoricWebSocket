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

#import "DoricWebSocketPlugin.h"
#import "DoricWebSocketInstance.h"
#import <stdatomic.h>
@interface DoricWebSocketPlugin()
@property(nonatomic, strong) NSMutableDictionary *websocketDic;
@property(atomic) NSUInteger count;
@end

@implementation DoricWebSocketPlugin

- (instancetype)init {
    if (self = [super init]) {
        self.websocketDic = [[NSMutableDictionary alloc] init];
    }
    return self;
}

- (void)create:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    self.count++;
    
    DoricWebSocketInstance *websocket = [[DoricWebSocketInstance alloc] init];
    NSString *key = [NSString stringWithFormat:@"%lu", (unsigned long)self.count];
    [self.websocketDic setObject:websocket forKey:key];
    
    NSString *onopen = dic[@"onopen"];
    DoricPromise *onopenPromise = [[DoricPromise alloc] initWithContext:self.doricContext callbackId:onopen];
    websocket.onopenPromise = onopenPromise;
    
    NSString *onclose = dic[@"onclose"];
    DoricPromise *onclosePromise = [[DoricPromise alloc] initWithContext:self.doricContext callbackId:onclose];
    websocket.onclosePromise = onclosePromise;
    
    NSString *onerror = dic[@"onerror"];
    DoricPromise *onerrorPromise = [[DoricPromise alloc] initWithContext:self.doricContext callbackId:onerror];
    websocket.onerrorPromise = onerrorPromise;
    
    NSString *onmessage = dic[@"onmessage"];
    DoricPromise *onmessagePromise = [[DoricPromise alloc] initWithContext:self.doricContext callbackId:onmessage];
    websocket.onmessagePromise = onmessagePromise;
    
    [promise resolve:@(_count)];
}

- (void)open:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSUInteger identifier = [dic[@"identifier"] intValue];
    NSString *url = dic[@"url"];
    
    NSString *key = [NSString stringWithFormat:@"%lu", (unsigned long)identifier];
    DoricWebSocketInstance *websocket = [self.websocketDic objectForKey:key];
    [websocket open:url];
}

- (void)send:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSUInteger identifier = [dic[@"identifier"] intValue];
    NSString *dataString = dic[@"data"];
    NSArray *strings = [dataString componentsSeparatedByString:@","];
    NSUInteger length = strings.count - 1;
    Byte bytes[length];
    for (int i = 0; i < length; i++) {
        NSString *str = [strings objectAtIndex:i];
        int byte = [str intValue];
        bytes[i] = byte;
    }
    
    NSData *data = [[NSData alloc] initWithBytes:bytes length:length];
    NSString *key = [NSString stringWithFormat:@"%lu", (unsigned long)identifier];
    DoricWebSocketInstance *websocket = [self.websocketDic objectForKey:key];
    [websocket send:data];
}

- (void)close:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSUInteger identifier = [dic[@"identifier"] intValue];
    NSString *key = [NSString stringWithFormat:@"%lu", (unsigned long)identifier];
    DoricWebSocketInstance *websocket = [self.websocketDic objectForKey:key];
    [websocket close];
    
    if (websocket != nil) {
        [promise resolve:@(YES)];
    } else {
        [promise reject:@(NO)];
    }
}

- (void)destroy:(NSDictionary *)dic withPromise:(DoricPromise *)promise {
    NSUInteger identifier = [dic[@"identifier"] intValue];
    NSString *key = [NSString stringWithFormat:@"%lu", (unsigned long)identifier];
    DoricWebSocketInstance *websocket = [self.websocketDic objectForKey:key];
    [self.websocketDic removeObjectForKey:key];
    
    if (websocket != nil) {
        [promise resolve:@(YES)];
    } else {
        [promise reject:@(NO)];
    }
}

- (void)dealloc
{
    for (NSString *key in self.websocketDic) {
        DoricWebSocketInstance *websocket = [self.websocketDic objectForKey:key];
        [websocket close];
    }
    [self.websocketDic removeAllObjects];
}
@end
