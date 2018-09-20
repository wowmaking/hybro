#import "Hybro.h"


@implementation Hybro

static UIViewController *rootViewControler = nil;

+ (void) setRootViewController:(UIViewController*)vc;
{
  rootViewControler = vc;
}

+ (UIViewController*) getRootViewController;
{
  return rootViewControler;
}

@end
