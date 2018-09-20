#import <Cordova/CDVViewController.h>
#import <React/RCTViewManager.h>

#import "Hybro.h"
#import "HybroViewManager.h"
#import "HybroCordovaPlugin.h"

@implementation HybroViewManager

RCT_EXPORT_MODULE()

- (UIView *)view
{
  CDVViewController* vc = [CDVViewController new];
  [[Hybro getRootViewController] addChildViewController:vc];
  return vc.view;
}

@end


