#import <Cordova/CDVPlugin.h>

#import "HybroModule.h"
#import "HybroCordovaPlugin.h"

@implementation HybroModule

static HybroModule *singleton = nil;

+ (nonnull instancetype)instance {
  return singleton;
}

- (id)init {
  self = [super init];
  if (self != nil) {
    singleton = self;
  }
  return self;
}

RCT_EXPORT_MODULE(Hybro);


RCT_EXPORT_METHOD(success:(NSString*)callbackId response:(NSDictionary *)response)
{
  [[HybroCordovaPlugin instance] success:callbackId response:response];
}

RCT_EXPORT_METHOD(error:(NSString*)callbackId error:(NSString *)error)
{
  [[HybroCordovaPlugin instance] error:callbackId error:error];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[@"cordova-invoke"];
}

- (void)commandReceived:(NSString*)callbackId arguments:(NSArray *)arguments
{
  [self sendEventWithName:@"cordova-invoke" body:@{ @"callbackId": callbackId, @"args": arguments }];
}

@end
